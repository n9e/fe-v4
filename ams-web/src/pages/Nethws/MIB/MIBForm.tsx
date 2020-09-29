/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  Input, Modal, Form, Upload, Button, Icon,
} from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormProps } from 'antd/lib/form';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';

interface Props {
  type: 'create' | 'modify',
  initialValues?: any,
  onOk: (values: any, destroy?: () => void) => void,
}

const FormItem = Form.Item;

class MIBForm extends Component<Props & ModalWrapProps & FormProps> {
  state = {
    file: undefined,
  }

  titleMap = {
    create: <FormattedMessage id="table.create" />,
    modify: <FormattedMessage id="table.modify" />,
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        this.props.onOk({
          ...values,
          file: this.state.file,
        }, this.props.destroy);
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
          <FormItem
            label={
              <span>
                <FormattedMessage id="mibs.file" /> <FormattedMessage id="mibs.file.help" />
              </span>
            }
          >
            {getFieldDecorator('file', {
              rules: [{ required: true }],
              onChange: (e: any) => {
                this.setState({ file: e.file.originFileObj });
              },
            } as any)(
              <Upload
                accept="application/x-gzip"
              >
                <Button>
                  <Icon type="upload" /> Click to upload
                </Button>
              </Upload>,
            )}
          </FormItem>
          <FormItem
            label={
              <span>
                <FormattedMessage id="mibs.module" /> <FormattedMessage id="mibs.module.help" />
              </span>
            }
          >
            {getFieldDecorator('module', {
              initialValue: initialValues ? initialValues.module : '',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="mibs.note" />}>
            {getFieldDecorator('note', {
              initialValue: initialValues ? initialValues.note : '',
            })(
              <Input.TextArea />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(MIBForm));
