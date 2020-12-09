import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Divider, Popconfirm, Table, message, Dropdown, Menu, Icon } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import { prefixCls } from '@common/config';
import api from '@common/api';
import update from 'immutability-helper';
import AddModal from './AddModal';
import ModifyModal from './ModifyModal';
import CloneModal from './CloneModal';
import BatchImportExportModal from './BatchImportExportModal';
import './style.less';

let dragingIndex = -1;

class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />,
      ),
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveRow(dragIndex, hoverIndex);

    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget(
  'row',
  rowTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }),
)(
  DragSource(
    'row',
    rowSource,
    connect => ({
      connectDragSource: connect.dragSource(),
    }),
  )(BodyRow),
);

class Screen extends Component {
  static contextType = NsTreeContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchVal: '',
      data: [],
    };
  }

  componentDidMount = () => {
    this.fetchData();
  }

  componentWillMount = () => {
    const { selectedNode } = this.context.data;
    this.selectedNodeId = _.get(selectedNode, 'id');
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const { selectedNode } = nextContext.data;
    const nextSelectedNodeId = _.get(selectedNode, 'id');

    if (!_.isEqual(this.selectedNodeId, nextSelectedNodeId)) {
      this.selectedNodeId = nextSelectedNodeId;
      this.fetchData();
    }
  }

  fetchData() {
    if (this.selectedNodeId) {
      this.setState({ loading: true });
      request(`${api.monNode}/${this.selectedNodeId}/screen`).then((res) => {
        this.setState({ data: _.sortBy(res, 'weight') });
      }).finally(() => {
        this.setState({ loading: false });
      });
    }
  }

  handleAdd = () => {
    AddModal({
      language: this.props.intl.locale,
      title: this.props.intl.formatMessage({ id: 'table.create' }),
      onOk: (values) => {
        request(`${api.monNode}/${this.selectedNodeId}/screen`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            weight: this.state.data.length,
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          this.fetchData();
        });
      },
    });
  }

  handleModify = (record) => {
    ModifyModal({
      language: this.props.intl.locale,
      name: record.name,
      title: this.props.intl.formatMessage({ id: 'table.modify' }),
      onOk: (values) => {
        request(`${api.screen}/${record.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...values,
            node_id: record.node_id,
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
          this.fetchData();
        });
      },
    });
  }

  handleDel = (id) => {
    request(`${api.screen}/${id}`, {
      method: 'DELETE',
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.delete.success' }));
      this.fetchData();
    });
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];

    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
      () => {
        const reqBody = _.map(this.state.data, (item, i) => {
          return {
            id: item.id,
            weight: i,
          };
        });
        request(`${api.screen}s/weights`, {
          method: 'PUT',
          body: JSON.stringify(reqBody),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.sort.success' }));
        });
      },
    );
  }

  handleBatchImportBtnClick = () => {
    BatchImportExportModal({
      type: 'import',
      title: '导入策略',
      selectedNid: this.selectedNodeId,
      onOk: () => {
        this.fetchData();
      },
    });
  }

  handleBatchExportBtnClick = () => {
    const { selectedRows } = this.state;
    const newSelectedRows = _.map(selectedRows, (row) => {
      const record = _.cloneDeep(row);
      delete record.id;
      delete record.nid;
      delete record.callback;
      delete record.creator;
      delete record.created;
      delete record.last_updator;
      delete record.last_updated;
      delete record.excl_nid;
      delete record.notify_group;
      delete record.notify_user;
      delete record.leaf_nids;
      delete record.need_upgrade;
      delete record.alert_upgrade;
      return record;
    });
    BatchImportExportModal({
      data: newSelectedRows,
      type: 'export',
      title: '导出策略',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  handleClone(record) {
    const { intl } = this.props;
    CloneModal({
      language: intl.locale,
      selectedNodeId: this.selectedNodeId,
      oldRecord: record,
      onSuccess: () => {
        message.success(intl.formatMessage({ id: 'msg.clone.success' }));
        this.fetchData();
      },
      onError: () => {
        message.success(intl.formatMessage({ id: 'msg.clone.error' }));
      },
    });
  }

  render() {
    const { searchVal } = this.state;
    const data = _.filter(this.state.data, (item) => {
      if (searchVal) {
        return item.name.indexOf(searchVal) > -1;
      }
      return true;
    });
    return (
      <div className={`${prefixCls}-monitor-screen`}>
        <div className="mb10" style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left' }}>
            <Input.Search
              style={{ width: 200 }}
              placeholder="请输入查询名称"
              onSearch={(value) => {
                this.setState({ searchVal: value });
              }}
            />
          </div>
          <div style={{ float: 'right' }}>
            <Button className="mr10" onClick={this.handleAdd}>
              <FormattedMessage id="screen.create" />
            </Button>
            {/* <Dropdown
              overlay={
                <Menu>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchImportBtnClick(); }}>导入策略</a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => { this.handleBatchExportBtnClick(); }}>导出策略</a>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                <FormattedMessage id="table.batch.operations" /> <Icon type="down" />
              </Button>
            </Dropdown> */}
          </div>
        </div>
        <Table
          rowKey="id"
          dataSource={data}
          pagination={false}
          rowSelection={{
            selectedRowKeys: _.map(this.state.selectedRows, 'id'),
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                selectedRows,
              });
            },
          }}
          components={{
            body: {
              row: DragableBodyRow,
            },
          }}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
          columns={[
            {
              title: <FormattedMessage id="table.name" />,
              dataIndex: 'name',
              render: (text, record) => {
                return <Link to={{ pathname: `/screen/${record.id}` }}>{text}</Link>;
              },
            }, {
              title: <FormattedMessage id="table.creator" />,
              width: 200,
              dataIndex: 'last_updator',
            }, {
              title: <FormattedMessage id="table.operations" />,
              width: 200,
              render: (text, record) => {
                return (
                  <span>
                    <a onClick={() => this.handleModify(record)}><FormattedMessage id="table.modify" /></a>
                    <Divider type="vertical" />
                    <a onClick={() => this.handleClone(record)}><FormattedMessage id="table.clone" /></a>
                    <Divider type="vertical" />
                    <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => this.handleDel(record.id)}>
                      <a><FormattedMessage id="table.delete" /></a>
                    </Popconfirm>
                  </span>
                );
              },
            },
          ]}
        />
      </div>
    );
  }
}

export default CreateIncludeNsTree(DragDropContext(HTML5Backend)(injectIntl(Screen)), { visible: true });
