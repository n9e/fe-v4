import React, { Component } from 'react';
import { Input, Modal, Form } from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormProps } from 'antd/lib/form';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import { NodeCate } from '@interface';

interface Props {
  type: 'create' | 'modify',
  initialValues?: NodeCate,
  onOk: (values: any, destroy?: () => void) => void,
}

const FormItem = Form.Item;

class NodeCateForm extends Component<Props & ModalWrapProps & FormProps> {
  titleMap = {
    create: <FormattedMessage id="node.cate.create" />,
    modify: <FormattedMessage id="node.cate.modify" />,
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        this.props.onOk(values, this.props.destroy);
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { type, initialValues, visible } = this.props;
    const { getFieldDecorator } = this.props.form!;

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
          <FormItem label={<FormattedMessage id="node.color" />}>
            {getFieldDecorator('icon_color', {
              initialValue: initialValues ? initialValues.icon_color : '',
              rules: [{ required: true }],
            })(
              <Input type="color" />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.cate" />}>
            {getFieldDecorator('ident', {
              initialValue: initialValues ? initialValues.ident : '',
              rules: [{ required: true }],
            })(
              <Input disabled={type === 'modify'} />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.cate.name" />}>
            {getFieldDecorator('name', {
              initialValue: initialValues ? initialValues.name : '',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(NodeCateForm));
