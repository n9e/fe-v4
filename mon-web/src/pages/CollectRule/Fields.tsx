import React from 'react';
import {
  Input, InputNumber, Switch, Spin, Form,
} from 'antd';
import _ from 'lodash';
import BaseList from './BaseList';
import BaseGroupList from './BaseGroupList';
import { FieldType } from './Types';

interface Props {
  loading?: boolean;
  nType: 'add' | 'modify';
  field: FieldType;
  definitions: {
    [index: string]: FieldType[];
  };
  initialValues: any;
  getFieldDecorator: any;
  labelCol?: any;
  wrapperCol?: any;
}

export default function Fields(props: Props) {
  const {
    nType, loading, initialValues, getFieldDecorator, definitions,
    labelCol, wrapperCol,
  } = props;
  const {
    label, type, items, name, required, example, description,
  } = props.field;
  const defaultVal = props.field.default;

  switch (type) {
    case 'string':
      return (
        <Form.Item label={label} required={required}
          extra={description} labelCol={labelCol} wrapperCol={wrapperCol}
        >
          {getFieldDecorator(name, {
            initialValue:
              nType === 'modify' ? _.get(initialValues, name) : defaultVal,
            rules: [{ required, message: '必填项！' }],
          })(<Input placeholder={example} />)}
        </Form.Item>
      );
    case 'integer':
      return (
        <Form.Item label={label} required={required}
          extra={description} labelCol={labelCol} wrapperCol={wrapperCol}
        >
          {getFieldDecorator(name, {
            initialValue:
              nType === 'modify' ? _.get(initialValues, name) : defaultVal,
            rules: [{ required: true, message: '必填项！' }],
          })(<InputNumber placeholder={example} />)}
        </Form.Item>
      );
    case 'folat':
      return (
        <Form.Item label={label} required={required}
          extra={description} labelCol={labelCol} wrapperCol={wrapperCol}
        >
          {getFieldDecorator(name, {
            initialValue:
              nType === 'modify' ? _.get(initialValues, name) : defaultVal,
            rules: [{ required, message: '必填项！' }],
          })(<InputNumber placeholder={example} />)}
        </Form.Item>
      );
    case 'boolean':
      return (
        <Form.Item label={label} required={required}
          extra={description} labelCol={labelCol} wrapperCol={wrapperCol}
        >
          {getFieldDecorator(name, {
            initialValue:
              nType === 'modify' ? _.get(initialValues, name) : defaultVal,
            rules: [{ required, message: '必填项！' }],
            valuePropName: 'checked',
          })(<Switch />)}
        </Form.Item>
      );
    case 'array':
      if (loading) return <Spin />;
      if (items.type === 'string') {
        return (
          <Form.Item label={label} required={required}
            labelCol={labelCol} wrapperCol={wrapperCol}
          >
            <div style={{ lineHeight: '20px', marginTop: 10 }}>{description}</div>
            <BaseList
              nType={nType}
              data={props.field}
              getFieldDecorator={getFieldDecorator}
              initialValues={_.get(initialValues, name)}
            />
          </Form.Item>
        );
      }
      if (items.$ref) {
        const ref = items.$ref;
        return (
          <Form.Item label={label} required={required}
            labelCol={labelCol} wrapperCol={wrapperCol}
          >
            <div style={{ lineHeight: '20px', marginTop: 10 }}>{description}</div>
            <BaseGroupList
              nType={nType}
              field={props.field}
              definitions={definitions}
              tempData={definitions[ref]}
              initialValues={initialValues}
              getFieldDecorator={getFieldDecorator}
            />
          </Form.Item>
        );
      }
      return <span>没有匹配的 Field 组件</span>;
    default:
      return <span>没有匹配的 Field 组件</span>;
  }
}
