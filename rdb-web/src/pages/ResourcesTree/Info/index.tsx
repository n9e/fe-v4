import React from 'react';
import {
  Table, Input, Form, Select, InputNumber, DatePicker, message,
} from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { injectIntl, FormattedMessage } from 'react-intl';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import './style.less';

function fetchDataByType(type: 'user' | 'team') {
  return request(`${api[type]}s${type === 'team' ? '/all' : ''}?limit=1000`).then((res: any) => res.list || []);
}

function fetchNodeCateFieldData(id: number) {
  return request(`${api.node}/${id}/fields`);
}

function fetchNodeCateFieldSetting(cate: string) {
  return request(`${api.nodeCates}/fields?cate=${cate}`);
}

const EditableContext = React.createContext(null);

const EditableRow = ({ form, _index, ...props }: any) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component<any, any> {
  input: any;

  form: any;

  datePickerVisible = false;

  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = (e: any) => {
    const { record, handlesave } = this.props;
    this.form.validateFields((error: any, values: any) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      let val = values.field_value;
      if (_.isNumber(val)) {
        val = _.toString(val);
      } else if (moment.isMoment(val)) {
        val = val.format('YYYY-MM-DD HH:mm:ss');
      } else if (_.isArray(val)) {
        val = _.join(val, ',');
      }
      this.toggleEdit();
      if (record.field_value !== val) {
        handlesave({ ...record, field_value: val });
      }
    });
  };

  renderCell = (form: any) => {
    this.form = form;
    const {
      children, dataindex, record, userdata, teamdata,
    } = this.props;
    const { editing } = this.state;
    const formItemProps = {
      ref: (node: any) => { this.input = node; },
      onPressEnter: this.save,
      onBlur: this.save,
    };
    let fieldCpt = <Input {...formItemProps} />;
    let initialValue = record[dataindex];
    if (record.field_type === 'string' && record.field_extra === 'textarea') {
      fieldCpt = <Input.TextArea {...formItemProps} />;
    }
    if (record.field_type === 'number') {
      fieldCpt = <InputNumber style={{ width: '100%' }} {...formItemProps} />;
      initialValue = initialValue ? Number(initialValue) : undefined;
    }
    if (record.field_type === 'enum') {
      fieldCpt = (
        <Select style={{ width: '100%' }} {...formItemProps}>
          {
            _.map(_.split(record.field_extra, ','), (item) => {
              return <Select.Option key={item} value={item}>{item}</Select.Option>;
            })
          }
        </Select>
      );
    }
    if (record.field_type === 'time') {
      fieldCpt = (
        <DatePicker
          showTime
          style={{ width: '100%' }}
          ref={(node: any) => { this.input = node; }}
          onOpenChange={(status) => {
            this.datePickerVisible = status;
            if (!status) {
              this.save({});
            }
          }}
          onBlur={() => {
            if (!this.datePickerVisible) {
              this.toggleEdit();
            }
          }}
        />
      );
      initialValue = initialValue ? moment(initialValue) : undefined;
    }
    if (record.field_type === 'user') {
      fieldCpt = (
        <Select style={{ width: '100%' }} mode="multiple" {...formItemProps}>
          {
            _.map(userdata, (item: any) => {
              return <Select.Option key={item.username} value={item.username}>{item.username}</Select.Option>;
            })
          }
        </Select>
      );
      initialValue = initialValue ? _.split(initialValue, ',') : undefined;
    }
    if (record.field_type === 'team') {
      fieldCpt = (
        <Select style={{ width: '100%' }} mode="multiple" {...formItemProps}>
          {
            _.map(teamdata, (item: any) => {
              return <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>;
            })
          }
        </Select>
      );
      initialValue = initialValue ? _.split(initialValue, ',') : undefined;
    }

    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataindex, {
          rules: [
            {
              required: record.field_required,
            },
          ],
          initialValue,
        // eslint-disable-next-line no-return-assign
        })(
          fieldCpt,
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

class EditableTable extends React.Component<any, any> {
  columns: any;

  constructor(props: any) {
    super(props);
    this.state = {
      userData: [],
      teamData: [],
      dataSource: [],
      loading: false,
      admins: [],
    };
  }

  componentDidMount() {
    fetchDataByType('user').then((data) => {
      this.setState({ userData: data });
    });
    fetchDataByType('team').then((data) => {
      this.setState({ teamData: data });
    });
    const selectedTreeNode = this.context.getSelectedNode();
    if (selectedTreeNode) {
      this.fetchData(selectedTreeNode);
    }
  }

  componentWillReceiveProps = async (_nextProps: any, nextContext: any) => {
    const selectedTreeNode = this.context.getSelectedNode();
    const nextSelectedTreeNode = nextContext.getSelectedNode();
    if (nextSelectedTreeNode && !_.isEqual(selectedTreeNode, nextSelectedTreeNode)) {
      this.fetchData(nextSelectedTreeNode);
    }
  }

  async fetchData(selectedTreeNode: any) {
    try {
      this.setState({ dataSource: [], loading: true });
      const nodeCateFieldData = await fetchNodeCateFieldData(selectedTreeNode.id);
      const nodeCateFieldSettings = await fetchNodeCateFieldSetting(selectedTreeNode.cate);
      const admins = await request(`${api.node}/${selectedTreeNode.id}`).then((res) => {
        return res.admins;
      });
      const dataSource = _.map(nodeCateFieldSettings, (item) => ({
        ...item,
        field_value: _.get(_.find(nodeCateFieldData, { field_ident: item.field_ident }), 'field_value'),
      }));
      this.setState({ dataSource, admins: _.map(admins, 'dispname'), loading: false });
    } catch (e) {
      console.log(e);
    }
  }

  handleSave = (row: any) => {
    const { dataSource } = this.state;
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.field_ident === item.field_ident);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });

    const reqBody = _.map(newData, (reqItem: any) => {
      let val = reqItem.field_value;
      if (val) {
        if (_.isNumber(val)) {
          val = _.toString(val);
        } else if (moment.isMoment(val)) {
          val = val.format('YYYY-MM-DD HH:mm:ss');
        } else if (_.isArray(val)) {
          val = _.join(val, ',');
        }
      }
      return {
        field_ident: reqItem.field_ident,
        field_value: val,
      };
    });
    const selectedTreeNode = this.context.getSelectedNode();
    request(`${api.node}/${selectedTreeNode.id}/fields`, {
      method: 'PUT',
      body: JSON.stringify(reqBody),
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
    });
  };

  render() {
    const selectedTreeNode = this.context.getSelectedNode();
    const { dataSource, admins, loading } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    let columns = [
      {
        title: 'Extend Field',
        dataIndex: 'field_name',
        width: '30%',
        render: (text: string, record: any) => {
          return (
            <span>
              {text}
              {
                record.field_required ? <span style={{ color: '#f50' }}>*</span> : null
              }
            </span>
          );
        },
      }, {
        title: 'Value',
        dataIndex: 'field_value',
        editable: true,
      },
    ];
    columns = columns.map((col: any) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any) => ({
          record,
          editable: col.editable,
          dataindex: col.dataIndex,
          title: col.title,
          userdata: this.state.userData,
          teamdata: this.state.teamData,
          handlesave: this.handleSave,
        }),
      };
    });
    if (!selectedTreeNode) {
      return <FormattedMessage id="tree.select.node" />;
    }
    return (
      <>
        <Table
          style={{ marginBottom: 20 }}
          bordered
          dataSource={[
            {
              key: this.props.intl.formatMessage({ id: 'node.id.label' }),
              value: selectedTreeNode.id,
            }, {
              key: this.props.intl.formatMessage({ id: 'node.cate.label' }),
              value: selectedTreeNode.cate,
            }, {
              key: this.props.intl.formatMessage({ id: 'node.ident.label' }),
              value: selectedTreeNode.ident,
            }, {
              key: this.props.intl.formatMessage({ id: 'node.path.label' }),
              value: selectedTreeNode.path,
            }, {
              key: this.props.intl.formatMessage({ id: 'node.admins' }),
              value: _.join(admins, ', '),
            }, {
              key: this.props.intl.formatMessage({ id: 'node.note.label' }),
              value: selectedTreeNode.note,
            }
          ]}
          columns={[{
            title: 'Base Field',
            width: '30%',
            dataIndex: 'key'
          }, {
            title: 'Value',
            dataIndex: 'value'
          }]}
          pagination={false}
        />
        <Table
          rowKey="id"
          loading={loading}
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </>
    );
  }
}

EditableTable.contextType = NsTreeContext;

export default injectIntl(EditableTable);
