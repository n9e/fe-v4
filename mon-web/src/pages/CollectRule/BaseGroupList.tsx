import React from 'react';
import { Form, Input, Button } from 'antd';
import { useDynamicList } from '@umijs/hooks';
import BaseList from './BaseList';

interface CardProps {
  form: any;
  tempData: any[];
  initialValues: any;
  getFieldDecorator:any
}

const Card = (props: any) => {
  return props?.tempData?.map((item: any) => {
    if (item.type !== 'array') {
      return (
        <Form.Item label={item.label}>
          {props.getFieldDecorator(`params[${props.index}].${item.name}`, {
            initialValue: props[item.name],
          })(<Input placeholder={item.description} />)}
        </Form.Item>
      );
    } else {
      return <BaseList data={item} getFieldDecorator={props.getFieldDecorator} />;
    }
  });
};

export default (props: CardProps) => {
  const { list, push, getKey } = useDynamicList(['']);
  console.log('tem', props.tempData)
  return (
    <div style={{ width: 800, margin: 'auto', display: 'flex' }}>
      <div style={{ width: 400, marginRight: 16 }}>
        {list?.map((ele: any, index: any) => (
          <Card
            getFieldDecorator={props.getFieldDecorator}
            tempData={props.tempData}
          />
        ))}
        <Button style={{ marginTop: 16 }} block onClick={() => push({})}>
          Add Command
        </Button>
      </div>
    </div>
  );
};
