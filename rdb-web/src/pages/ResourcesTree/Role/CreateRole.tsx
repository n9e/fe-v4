import React, { Component } from 'react';
import {
  Modal, Form, Select, message,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@pkgs/api';
import UserSelect from '@pkgs/UserSelect';

const FormItem = Form.Item;

class CreateRole extends Component<any & WrappedComponentProps & FormProps> {
  state = {
    roleData: [],
  };

  componentDidMount = () => {
    this.fetchRoleData();
  }

  fetchRoleData() {
    request(`${api.roles}/local`).then((res) => {
      this.setState({ roleData: res });
    });
  }

  handleOk = () => {
    const { selectedNode } = this.props;
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.node}/${selectedNode.id}/roles`, {
          method: 'POST',
          body: JSON.stringify(values),
        }).then(() => {
          message.success('权限配置新增成功！');
          this.props.onOk();
          this.props.destroy();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { visible, selectedNode } = this.props;
    const { getFieldDecorator } = this.props.form!;
    const { roleData } = this.state;

    return (
      <Modal
        title={<FormattedMessage id="resource.role.create" />}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={<FormattedMessage id="tree.node" />}>
            <span className="ant-form-text">{_.get(selectedNode, 'path')}</span>
          </FormItem>
          <FormItem label={<FormattedMessage id="user.username" />}>
            {getFieldDecorator('usernames', {
              rules: [{ required: true }],
            })(
              <UserSelect batchInputEnabled mode="multiple" optionKey="username" />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="resourcesTree.role.point" />}>
            {getFieldDecorator('role_id', {
              rules: [{ required: true }],
            })(
              <Select>
                {
                  _.map(roleData, (item: any) => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)
                }
              </Select>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(CreateRole)) as any);
