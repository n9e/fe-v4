import React, { Component } from 'react';
import {
  Input, Modal, Form, Switch, Select, Radio,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import { NodeCateField } from '@interface';
import { fields } from './config';

interface Props {
  language: string,
  type: 'create' | 'modify',
  initialValues: NodeCateField,
  onOk: (values: any, destroy?: () => void) => void,
}

const FormItem = Form.Item;

class FormForm extends Component<Props & ModalWrapProps & FormProps> {
  titleMap = {
    create: "创建扩展字段",
    modify: "修改扩展字段",
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        values.field_required = values.field_required === true ? 1 : 0;
        if (values.field_type === 'enum') {
          values.field_extra = _.join(values.field_extra);
        }
        this.props.onOk(values, this.props.destroy);
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const {
      type, initialValues, visible, language,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form!;
    const fieldType = getFieldValue('field_type') || initialValues.field_type;

    getFieldDecorator('cate', { initialValue: initialValues.cate });

    return (
      <Modal
        title={this.titleMap[type]}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form
          layout="vertical"
          onSubmit={(e) => {
            e.preventDefault();
            this.handleOk();
          }}
        >
          <FormItem label="标识">
            {getFieldDecorator('field_ident', {
              initialValue: initialValues ? initialValues.field_ident : '',
              rules: [{ required: true }],
            })(
              <Input disabled={type === 'modify'} />,
            )}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('field_name', {
              initialValue: initialValues ? initialValues.field_name : '',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="分类">
            {getFieldDecorator('field_cate', {
              initialValue: initialValues ? initialValues.field_cate : 'Default',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="字段类型">
            {getFieldDecorator('field_type', {
              initialValue: initialValues ? initialValues.field_type : '',
              rules: [{ required: true }],
              onChange: () => {
                setFieldsValue({
                  field_extra: undefined,
                });
              },
            } as any)(
              <Select>
                {
                  _.map(fields, (item) => {
                    return (
                      <Select.Option key={item.ident} value={item.ident}>
                        { item.name }
                      </Select.Option>
                    );
                  })
                }
              </Select>,
            )}
          </FormItem>
          {
            fieldType === 'string' ?
              (
                <FormItem label="输入框类型">
                  {getFieldDecorator('field_extra', {
                    initialValue: initialValues.field_extra,
                  })(
                    <Radio.Group>
                      <Radio value="input">单行输入框</Radio>
                      <Radio value="textarea">多行输入框</Radio>
                    </Radio.Group>,
                  )}
                </FormItem>
              ) : null
          }
          {
            fieldType === 'number' ?
              (
                <FormItem label="单位">
                  {getFieldDecorator('field_extra', {
                    initialValue: initialValues.field_extra,
                  })(
                    <Input />,
                  )}
                </FormItem>
              ) : null
          }
          {
            fieldType === 'enum' ?
              (
                <FormItem label="枚举值">
                  {getFieldDecorator('field_extra', {
                    initialValue: initialValues.field_extra ? _.split(initialValues.field_extra, ',') : undefined,
                  })(
                    <Select mode="tags" />,
                  )}
                </FormItem>
              ) : null
          }
          <FormItem label="是否必填项">
            {getFieldDecorator('field_required', {
              initialValue: initialValues.field_required === 1,
              valuePropName: 'checked',
            })(
              <Switch />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(FormForm));
