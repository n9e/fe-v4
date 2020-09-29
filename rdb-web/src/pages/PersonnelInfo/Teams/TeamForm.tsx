import React, { Component } from 'react';
import { Form, Input, Radio } from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormProps } from 'antd/lib/form';

interface Props {
  type: 'post' | 'put',
  isrootVsible: boolean,
  initialValue: any,
}

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class TeamForm extends Component<Props & FormProps> {
  static defaultProps: Props = {
    type: 'post',
    isrootVsible: false,
    initialValue: {},
  };

  validateFields() {
    return this.props.form!.validateFields;
  }

  render() {
    const { initialValue, type } = this.props;
    const { getFieldDecorator } = this.props.form!;
    return (
      <Form layout="vertical">
        <FormItem label={<FormattedMessage id="table.ident" />}>
          {getFieldDecorator('ident', {
            initialValue: initialValue.ident,
            rules: [{ required: true }],
          })(
            <Input disabled={type === 'put'} />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="table.name" />}>
          {getFieldDecorator('name', {
            initialValue: initialValue.name,
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="table.note" />}>
          {getFieldDecorator('note', {
            initialValue: initialValue.note,
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="team.mgmt" />} required>
          {getFieldDecorator('mgmt', {
            initialValue: initialValue.mgmt || 0,
            rules: [{ required: true }],
          })(
            <RadioGroup>
              <Radio value={0}><FormattedMessage id="team.member" /></Radio>
              <Radio value={1}><FormattedMessage id="team.admin" /></Radio>
            </RadioGroup>,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(TeamForm) as any;
