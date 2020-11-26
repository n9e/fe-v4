import React, { Component } from 'react';
import { Modal, Form, message } from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import UserSelect from '@pkgs/UserSelect/UserSelectMultiple';
import request from '@pkgs/request';
import api from '@common/api';

interface Props {
  id: number,
  type: 'tenant' | 'team' | 'role',
  mgmt: 0 | 1,
}

const FormItem = Form.Item;

class AddMembers extends Component<ModalWrapProps & FormProps & Props & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api[this.props.type]}/${this.props.id}/users/bind`, {
          method: 'PUT',
          body: JSON.stringify(values),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'member.create.success' }));
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
    const { visible, mgmt, type } = this.props;
    const { getFieldDecorator } = this.props.form!;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'member.management' })}
        visible={visible}
        width={1000}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form  {...formItemLayout}>
          {
            type === 'role' ?
              <FormItem label={this.props.intl.formatMessage({ id: 'member.member' })}>
                {getFieldDecorator('ids')(
                  <UserSelect mode="multiple" />,
                )}
              </FormItem> :
              <div>
                {
                  mgmt === undefined || mgmt === 1 ?
                    <FormItem label={this.props.intl.formatMessage({ id: 'member.admin' })}>
                      {getFieldDecorator('admin_ids')(
                        <UserSelect mode="multiple" />,
                      )}
                    </FormItem> : null
                }
                <FormItem label={this.props.intl.formatMessage({ id: 'member.member' })}>
                  {getFieldDecorator('member_ids')(
                    <UserSelect mode="multiple" />,
                  )}
                </FormItem>
              </div>
          }
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(AddMembers) as any) as any);
