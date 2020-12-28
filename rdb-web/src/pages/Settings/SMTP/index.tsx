import React, { Component } from 'react';
import { Form, Input, Button, Switch, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import request from '@pkgs/request';
import api from '@common/api';
import TestConf from './TestConf';

interface SMTPFields {
  smtpHost: string,
  smtpPort: string,
  smtpUser: string,
  smtpPass: string,
  smtpFromName: string,
  smtpFromMail: string,
  smtpUseTLS: 'yes' | 'no',
  smtpUseStartTLS: 'yes' | 'no',
  smtpInsecureSkipVerify: 0 | 1,
}

interface State {
  values: SMTPFields,
}

const FormItem = Form.Item;

class SMTP extends Component<FormComponentProps & WrappedComponentProps, State> {
  state = {
    values: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: '',
      smtpFromName: '',
      smtpFromMail: '',
      smtpUseTLS: 'yes',
      smtpUseStartTLS: 'yes',
      smtpInsecureSkipVerify: 0,
    },
  } as State;

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const dat = await request(`${api.configs}/smtp`);
      this.setState({
        values: {
          smtpHost: dat.smtpHost,
          smtpPort: dat.smtpPort,
          smtpUser: dat.smtpUser,
          smtpPass: dat.smtpPass,
          smtpFromName: dat.smtpFromName,
          smtpFromMail: dat.smtpFromMail,
          smtpUseTLS: dat.smtpUseTLS,
          smtpUseStartTLS: dat.smtpUseStartTLS,
          smtpInsecureSkipVerify: dat.smtpInsecureSkipVerify,
        },
      });
    } catch (e) { console.log(e) }
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          await request(`${api.configs}/smtp`, {
            method: 'PUT',
            body: JSON.stringify({
              ...values,
              smtpInsecureSkipVerify: values.smtpInsecureSkipVerify ? 1 : 0,
            }),
          });
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
        } catch (e) { console.log(e) }
      }
    });
  }

  handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        TestConf({
          language: this.props.intl.locale,
          values: {
            ...values,
            smtpInsecureSkipVerify: values.smtpInsecureSkipVerify ? 1 : 0,
          },
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { values } = this.state;
    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} style={{ width: 500 }}>
        <FormItem label="smtpHost" required>
          {getFieldDecorator('smtpHost', {
            initialValue: values.smtpHost,
            rules: [{ required: true, message:"必填项！" }],
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label="smtpPort">
          {getFieldDecorator('smtpPort', {
            initialValue: values.smtpPort,
            rules: [{ required: true, message:"必填项！" }],
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label="smtpUser">
          {getFieldDecorator('smtpUser', {
            initialValue: values.smtpUser,
            rules: [{ required: true, message:"必填项！" }],
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label="smtpPass">
          {getFieldDecorator('smtpPass', {
            initialValue: values.smtpPass,
            rules: [{ required: true , message:"必填项！"}],
          })(
            <Input.Password />,
          )}
        </FormItem>
        <FormItem label="smtpInsecureSkipVerify">
          {getFieldDecorator('smtpInsecureSkipVerify', {
            initialValue: values.smtpInsecureSkipVerify === 1,
            valuePropName: 'checked',
          })(
            <Switch
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="close" />}
            />,
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="form.submit.and.save" />
          </Button>
          <Button
            style={{ marginLeft: 10 }}
            onClick={this.handleTest}
          >
            <FormattedMessage id="smtp.test" />
          </Button>
        </FormItem>
      </Form>
    )
  }
}

export default injectIntl(Form.create()(SMTP));
