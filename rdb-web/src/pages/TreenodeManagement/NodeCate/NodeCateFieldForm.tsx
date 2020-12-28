import React, { Component } from 'react';
import {
  Input, Modal, Form, Switch, Select, Radio,
} from 'antd';
import { FormattedMessage } from 'react-intl';
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

class NodeCateFieldForm extends Component<Props & ModalWrapProps & FormProps> {
  titleMap = {
    create: <FormattedMessage id="node.cate.create" />,
    modify: <FormattedMessage id="node.cate.modify" />,
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
          <FormItem label={<FormattedMessage id="node.cate.field.ident" />}>
            {getFieldDecorator('field_ident', {
              initialValue: initialValues ? initialValues.field_ident : '',
              rules: [{ required: true, message:"必填项！" }],
            })(
              <Input disabled={type === 'modify'} />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.cate.field.name" />}>
            {getFieldDecorator('field_name', {
              initialValue: initialValues ? initialValues.field_name : '',
              rules: [{ required: true, message:"必填项！" }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.cate.field.type" />}>
            {getFieldDecorator('field_type', {
              initialValue: initialValues ? initialValues.field_type : '',
              rules: [{ required: true, message:"必填项！" }],
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
                        { language === 'zh' ? item.name : item.ident }
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
                <FormItem label={<FormattedMessage id="node.cate.field.extra.string" />}>
                  {getFieldDecorator('field_extra', {
                    initialValue: initialValues.field_extra,
                  })(
                    <Radio.Group>
                      <Radio value="input"><FormattedMessage id="node.cate.field.extra.string.input" /></Radio>
                      <Radio value="textarea"><FormattedMessage id="node.cate.field.extra.string.textarea" /></Radio>
                    </Radio.Group>,
                  )}
                </FormItem>
              ) : null
          }
          {
            fieldType === 'number' ?
              (
                <FormItem label={<FormattedMessage id="node.cate.field.extra.number" />}>
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
                <FormItem label={<FormattedMessage id="node.cate.field.extra.enum" />}>
                  {getFieldDecorator('field_extra', {
                    initialValue: initialValues.field_extra ? _.split(initialValues.field_extra, ',') : undefined,
                  })(
                    <Select mode="tags" />,
                  )}
                </FormItem>
              ) : null
          }
          <FormItem label={<FormattedMessage id="node.cate.field.required" />}>
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

export default ModalControl(Form.create()(NodeCateFieldForm));
