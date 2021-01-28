import React from 'react';
import { Form, Input, Switch } from 'antd';

interface IParams {
  getFieldDecorator: any,
}
const BaseAddForm = (props: IParams) => {
  const { getFieldDecorator } = props;

  return (
    <Form>
      <Form.Item label='名称'>
        {getFieldDecorator('cn', {
          rules: [{ required: true, message: "必填项！" }],
        })(
          <Input />,
        )}
      </Form.Item>
      <Form.Item label='英文名'>
        {getFieldDecorator('en', {
          rules: [{ required: true, message: "必填项！" }],
        })(
          <Input />,
        )}
      </Form.Item>
      <Form.Item label='是否叶子'>
        {getFieldDecorator('leaf', {
          rules: [{ required: true, message: "必填项！" }],
        })(
          <Switch />,
        )}
      </Form.Item>
    </Form>
  )
}

export default Form.create()(BaseAddForm);
