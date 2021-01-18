import React from "react";
import { Form, Input, Button, Icon } from "antd";
import _ from 'lodash';
import { useDynamicList } from "@umijs/hooks";
import BaseList from "./BaseList";

interface CardProps {
  nType: string;
  form: any;
  field: any;
  tempData: any[];
  initialValues: any;
  getFieldDecorator: any;
}

const Card = (props: any) => {
  return props?.tempData?.map((item: any) => {
    const name = `${props.groupName}[${props.groupKey}].${item.name}`;
    if (item.type !== "array") {
      return (
        <Form.Item label={item.label} key={name} required={item.required} help={item.description}>
          {props.getFieldDecorator(name, {
            initialValue: props.nType === 'modify' ? props?.initialValues[item.name] : item.default,
            rules: [
              {
                required: item.required,
                message: item.description,
              },
            ],
          })(<Input placeholder={item.example} />)}
        </Form.Item>
      );
    } else {
      return (
        <Form.Item label={item.label} key={name} required={item.required} help={item.description}>
          <BaseList
            nType={props.nType}
            key={name}
            data={{
              ...item,
              name,
            }}
            getFieldDecorator={props.getFieldDecorator}
            initialValues={props?.initialValues[item.name]}
          />
        </Form.Item>
      );
    }
  });
};

export default (props: CardProps) => {
  const { list, getKey, push, remove } = useDynamicList(props.initialValues || [{}]);
  return (
    <div style={{ width: '100%' }}>
      {list?.map((_item: any, idx: number) => (
        <div
          key={getKey(idx)}
          style={{
            border: "1px solid #e8e8e8",
            padding: 16,
            marginBottom: 16,
            position: 'relative',
          }}
        >
          <Card
            nType={props.nType}
            groupKey={getKey(idx)}
            groupName={props.field.name}
            getFieldDecorator={props.getFieldDecorator}
            tempData={props.tempData}
            initialValues={_item}
            style={{
              border: "1px solid #e8e8e8",
              padding: 16,
              marginBottom: 16,
            }}
          />
          <Icon
            type="close-circle"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              cursor: 'pointer',
            }}
            onClick={() => {
              remove(idx);
            }}
          />
        </div>
      ))}
      <Button style={{ marginTop: 16 }} block onClick={() => push({})}>
        新增
      </Button>
    </div>
  );
};
