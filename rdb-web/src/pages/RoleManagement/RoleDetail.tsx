import React, { Component } from 'react';
import _ from 'lodash';
import { Form, Input, Modal, message } from 'antd';
import { FormProps } from 'antd/lib/form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import { Role } from '@interface';
import request from '@pkgs/request';
import api from '@common/api';

interface Props {
  id: number,
  cate: 'global' | 'local',
  meta: any,
  operations: any,
  visible: true,
  onOk: () => void,
  onCancel: () => void,
  destroy: () => void,
}

interface OpsListItem {
  cn: string,
  en: string,
}

interface OpsTreeNode {
  system: string,
  groups: {
    title: string,
    ops: OpsListItem[],
  }[],
}

interface selectedOps {
  global: string[],
  local: string[],
  [index: string]: string[],
}

interface State {
  meta: Role,
  selected: selectedOps,
  opsList: OpsListItem[],
  opsTree: OpsTreeNode[],
}

const FormItem = Form.Item;

class RoleDetail extends Component<WrappedComponentProps & FormProps & Props & ModalWrapProps, State> {
  id = _.get(this.props.data, 'id');

  state = {
    ...this.state,
  } as State;

  handleOk = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.role}/${this.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...values,
            operations: this.props.operations,
          })
        }).then(() => {
          message.success('保存成功！');
          this.props.destroy();
          this.props.onOk();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { meta } = this.props;
    const { getFieldDecorator } = this.props.form!;

    getFieldDecorator('cate', { initialValue: this.props.cate });

    if (!meta) return null;
    return (
      <Modal
        width={800}
        title={this.props.intl.formatMessage({ id: 'table.modify' })}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={<FormattedMessage id="role.name" />}>
            {getFieldDecorator('name', {
              initialValue: meta.name,
              rules: [{ required: true, message:"必填项！" }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="table.note" />}>
            {getFieldDecorator('note', {
              initialValue: meta.note,
            })(
              <Input />,
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default ModalControl(Form.create()(injectIntl(RoleDetail)));
