/* eslint-disable react/no-danger */
import React from 'react';
import {
  Input, InputNumber, Switch, Spin, Form, Popover, Select,
} from 'antd';
import _ from 'lodash';
import BaseList from './BaseList';
import BaseGroupList from './BaseGroupList';
import { FieldType } from './Types';
import InputWithUpload from './InputWithUpload';

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
    label, type, items, name, itemName, required, example, description, format,
  } = props.field;
  const defaultVal = props.field.default;
  const fieldEnum = props.field.enum;

  switch (type) {
    case 'string':
      if (fieldEnum) {
        return (
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {getFieldDecorator(name, {
              initialValue:
                nType === 'modify' ? _.get(initialValues, name) : defaultVal,
              rules: [{ required, message: '必填项！' }],
            })(
              <Select placeholder={example}>
                {
                  _.map(fieldEnum, (item) => {
                    return <Select.Option key={item}>{item}</Select.Option>;
                  })
                }
              </Select>
            )}
          </Form.Item>
        );
      }
      if (format === 'file') {
        return (
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {getFieldDecorator(name, {
              initialValue:
                nType === 'modify' ? _.get(initialValues, name) : defaultVal,
              rules: [{ required, message: '必填项！' }],
            })(
              <InputWithUpload placeholder={example} />
            )}
          </Form.Item>
        );
      }
      if (format === 'password') {
        return (
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {getFieldDecorator(name, {
              initialValue:
                nType === 'modify' ? _.get(initialValues, name) : defaultVal,
              rules: [{ required, message: '必填项！' }],
            })(
              <Input.Password placeholder={example} />
            )}
          </Form.Item>
        );
      }
      if (format === 'text') {
        return (
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {getFieldDecorator(name, {
              initialValue:
                nType === 'modify' ? _.get(initialValues, name) : defaultVal,
              rules: [{ required, message: '必填项！' }],
            })(
              <Input.TextArea placeholder={example} autoSize={{ minRows: 2 }} />
            )}
          </Form.Item>
        );
      }
      return (
        <Form.Item
          label={<Popover content={itemName || name}>{label}</Popover>}
          required={required}
          extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
        >
          {getFieldDecorator(name, {
            initialValue:
              nType === 'modify' ? _.get(initialValues, name) : defaultVal,
            rules: [{ required, message: '必填项！' }],
          })(<Input placeholder={example} />)}
        </Form.Item>
      );
    case 'integer':
      if (fieldEnum) {
        return (
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            {getFieldDecorator(name, {
              initialValue:
                nType === 'modify' ? _.get(initialValues, name) : defaultVal,
              rules: [{ required, message: '必填项！' }],
            })(
              <Select placeholder={example}>
                {
                  _.map(fieldEnum, (item) => {
                    return <Select.Option value={item} key={item}>{item}</Select.Option>;
                  })
                }
              </Select>
            )}
          </Form.Item>
        );
      }
      return (
        <Form.Item
          label={<Popover content={itemName || name}>{label}</Popover>}
          required={required}
          extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
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
        <Form.Item
          label={<Popover content={itemName || name}>{label}</Popover>}
          required={required}
          extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
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
        <Form.Item
          label={<Popover content={itemName || name}>{label}</Popover>}
          required={required}
          extra={<div dangerouslySetInnerHTML={{ __html: description }} />}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
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
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            <div
              className="ant-form-extra"
              style={{ lineHeight: '20px', marginTop: 10, paddingTop: 0 }}
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
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
          <Form.Item
            label={<Popover content={itemName || name}>{label}</Popover>}
            required={required}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            <div
              className="ant-form-extra"
              style={{ lineHeight: '20px', marginTop: 10, paddingTop: 0 }}
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
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
