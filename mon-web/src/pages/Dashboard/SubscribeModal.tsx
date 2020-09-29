/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, TreeSelect, Select, message } from 'antd';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import request from '@pkgs/request';
import api from '@common/api';

const FormItem = Form.Item;
const { Option } = Select;
class SubscribeModal extends Component {
  static propTypes = {
    configsList: PropTypes.array.isRequired,
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    destroy: PropTypes.func,
  };

  static defaultProps = {
    title: '订阅到大盘',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      originTreeData: [],
      screenData: [],
      subclassData: [],
    };
  }

  componentDidMount() {
    this.fetchTreeData();
  }

  fetchTreeData() {
    request(api.tree).then((res) => {
      this.setState({ treeData: res });
      const treeData = normalizeTreeData(res);
      this.setState({ treeData, originTreeData: res });
    });
  }

  fetchScreenData() {
    const { getFieldValue } = this.props.form;
    const nid = getFieldValue('nid');

    if (nid !== undefined) {
      request(`${api.monNode}/${nid}/screen`).then((res) => {
        this.setState({ screenData: res });
      });
    }
  }

  fetchSubclassData() {
    const { getFieldValue } = this.props.form;
    const scrrenId = getFieldValue('scrrenId');

    if (scrrenId !== undefined) {
      request(`${api.screen}/${scrrenId}/subclass`).then((res) => {
        this.setState({ subclassData: res });
      });
    }
  }

  handleOk = () => {
    const { configsList } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          const subclassChartData = await request(`${api.subclass}/${values.subclassId}/chart`);
          const startWeight = _.get(subclassChartData, 'length', 0);
          await Promise.all(
            _.map(configsList, (item, i) => {
              return request(`${api.subclass}/${values.subclassId}/chart`, {
                method: 'POST',
                body: JSON.stringify({
                  configs: item,
                  weight: startWeight + i,
                }),
              });
            }),
          );
          message.success('图表订阅成功！');
          this.props.onOk();
          this.props.destroy();
        } catch (e) {
          console.log(e);
        }
      }
    });
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.destroy();
  }

  render() {
    const { title, visible, selectedNid } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        bodyStyle={{ padding: 14 }}
        okText="订阅"
      >
        <Form layout="vertical" onSubmit={(e) => {
          e.preventDefault();
          this.handleOk();
        }}>
          <FormItem label="所属节点">
            {getFieldDecorator('nid', {
              initialValue: selectedNid,
              rules: [{ required: true, message: '请选择所属节点!' }],
            })(
              <TreeSelect
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.treeData, 'treeSelect')}
              </TreeSelect>,
            )}
          </FormItem>
          <FormItem label="选择大盘">
            {getFieldDecorator('scrrenId', {
              rules: [{ required: true, message: '请选择所属大盘!' }],
            })(
              <Select
                onDropdownVisibleChange={(dropdownVisible) => {
                  if (dropdownVisible) {
                    this.fetchScreenData();
                  }
                }}
              >
                {
                  _.map(this.state.screenData, (item) => {
                    return <Option key={item.id} value={item.id}>{item.name}</Option>;
                  })
                }
              </Select>,
            )}
          </FormItem>
          <FormItem label="选择分类">
            {getFieldDecorator('subclassId', {
              rules: [{ required: true, message: '请选择所属分类!' }],
            })(
              <Select
                onDropdownVisibleChange={(dropdownVisible) => {
                  if (dropdownVisible) {
                    this.fetchSubclassData();
                  }
                }}
              >
                {
                  _.map(this.state.subclassData, (item) => {
                    return <Option key={item.id} value={item.id}>{item.name}</Option>;
                  })
                }
              </Select>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(SubscribeModal));
