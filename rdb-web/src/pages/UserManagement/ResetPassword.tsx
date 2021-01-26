import React, { Component } from 'react';
import { Modal, Form, Input, Icon, message } from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@pkgs/api';
import './style.less';

interface ExtraProps {
  id: number,
  pwd_expires_at: number
}

const FormItem = Form.Item;

class ResetPassword extends Component<ExtraProps & FormProps & ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  state = {
    pwdRules: ''
  }

  componentDidMount() {
    this.getPwdRule();
  }
  getPwdRule() {
    request(`${api.pwdRules}/pwd-rules`).then(res => this.setState({ pwdRules: res }))
  }
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
    const now = (new Date()).valueOf() / 1000
    const expire = ((this.props.pwd_expires_at - now) / (3600 * 24)).toFixed(0)
    return (
      <Modal
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        className='rdb-pwd'
      >
        {
          this.props.pwd_expires_at === 0 ? null :
            <div className='rdb-pwd-timestamp'>
              <Icon type="exclamation-circle" theme="filled" /> {Number(expire) > 0 ? `旧密码还有${expire}天过期` : '密码已过期！'}
            </div>
        }
        <Form layout="vertical">
          <FormItem label={intl.formatMessage({ id: 'password.new' })} required extra={this.state.pwdRules}>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: "必填项！" }],
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
