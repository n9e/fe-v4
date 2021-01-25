import React, { Component } from 'react';
import {
  Modal, Form, message, TreeSelect,
} from 'antd';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import { renderTreeNodes, normalizeTreeData } from '@pkgs/Layout/utils';
import api from '@pkgs/api';
const FormItem = Form.Item;

class BatchNode extends Component<any> {
  static defaultProps: any = {
    selected: [],
    title: '挂载资源',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  state = {
    treeData: [],
  }


  handleOk = () => {
    const { selected } = this.props;
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.hosts}/node`, {
          method: 'PUT',
          body: JSON.stringify({
            nodeid: values.nodeId,
            ids: _.map(selected, 'id'),
          }),
        }).then(() => {
          message.success('挂载成功');
          this.props.onOk();
          this.props.destroy();
        });
      }
    });
  }
  componentDidMount() {
    this.fetchTreeData();
  }
  handleCancel = () => {
    this.props.destroy();
  }

  fetchTreeData() {
    request(api.tree).then((res) => {
      const treeData = normalizeTreeData(res);
      this.setState({ treeData });
    });
  }

  render() {
    const { title, visible } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form
          layout="vertical"
          onSubmit={(e) => {
            e.preventDefault();
            this.handleOk();
          }}
        >
          <FormItem label="节点" >
            {getFieldDecorator('nodeId', {
              rules: [{ required: true }],
            })(
              <TreeSelect
                style={{ width: 300 }}
                placeholder='请选择子节点'
                showSearch
                allowClear
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.treeData, 'treeSelect')}
              </TreeSelect>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(BatchNode) as any);
