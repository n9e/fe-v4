import React from 'react';
import { Button, Icon } from 'antd';
import _ from 'lodash';
import { useDynamicList } from '@umijs/hooks';
import { FieldType } from './Types';
import Fields from './Fields';

interface CardProps {
  nType: string;
  field: FieldType;
  definitions: {
    [index: string]: FieldType[];
  };
  tempData: any[];
  initialValues: any;
  getFieldDecorator: any;
}

const Card = (props: any) => {
  return props?.tempData?.map((item: any) => {
    const name = `${props.groupName}[${props.groupKey}].${item.name}`;
    return (
      <Fields
        key={name}
        nType={props.nType}
        field={{
          ...item,
          name,
          itemName: item.name,
        }}
        definitions={props.definitions || {}}
        initialValues={props.initialValues}
        getFieldDecorator={props.getFieldDecorator}
      />
    );
  });
};

export default (props: CardProps) => {
  const { list, getKey, push, remove } = useDynamicList(props?.initialValues?.[props.field.name]);
  return (
    <div style={{ width: '100%', marginTop: 10 }}>
      {list?.map((_item: any, idx: number) => (
        <div
          key={getKey(idx)}
          style={{
            border: '1px solid #e8e8e8',
            padding: 16,
            marginBottom: 24,
            position: 'relative',
          }}
        >
          <Card
            nType={props.nType}
            groupKey={getKey(idx)}
            groupName={props.field.name}
            getFieldDecorator={props.getFieldDecorator}
            tempData={props.tempData}
            initialValues={props.initialValues}
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
      <Button style={{ marginBottom: 24 }} block onClick={() => push({})}>
        新增
      </Button>
    </div>
  );
};
