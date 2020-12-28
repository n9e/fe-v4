import React, { Component }from 'react';
import { Modal, Form, Input, Icon, message } from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@pkgs/api';

interface ExtraProps {
  id: number,
}

const FormItem = Form.Item;

class ResetPassword extends Component<ExtraProps & FormProps & ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    if (this.props.id) {
      this.props.form!.validateFields((err, values) => {
        if (!err) {
          request(`${api.user}/${this.props.id}/password`, {
            method: 'PUT',
            body: JSON.stringify(values),
          }).then(() => {
            message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
            this.props.onOk();
            this.props.destroy();
          });
        }
      });
    }
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { visible, intl } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={intl.formatMessage({ id: 'password.new' })} required>
            {getFieldDecorator('password', {
              rules: [{ required: true, message:"必填项！" }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
              />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(ResetPassword) as any) as any);
