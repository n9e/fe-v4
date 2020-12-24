import React, { Component } from 'react';
import { Input, Modal, Form, DatePicker } from 'antd';
import { FormProps } from 'antd/lib/form';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import { WhiteCreate } from '@interface';
import moment from 'moment';


interface IParams {
  startTime: number,
  endTime: number,
  startIp: string,
  endIp: string
}

interface Props {
  type: 'create' | 'modify',
  initialValues?: WhiteCreate,
  onOk: (values: IParams, destroy?: () => void) => void,
}

const FormItem = Form.Item;

class WhiteCreateForm extends Component<Props & ModalWrapProps & FormProps> {
  titleMap = {
    create: '创建白名单',
    modify: '修改白名单',
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values: IParams) => {
      if (!err) {
        const startTime = Math.floor(new Date(values.startTime).getTime());
        const endTime = Math.floor(new Date(values.endTime).getTime());
        this.props.onOk({ startIp: values.startIp, endIp: values.endIp, startTime: startTime, endTime: endTime }, this.props.destroy);
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
          <FormItem label='起始IP'>
            {getFieldDecorator('startIp', {
              initialValue: initialValues ? initialValues.startIp : '',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label='结束IP'>
            {getFieldDecorator('endIp', {
              initialValue: initialValues ? initialValues.endIp : '',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label='开始时间'>
            {getFieldDecorator('startTime', {
              initialValue: initialValues ? moment(initialValues.startTime) : '',
              rules: [{ required: true }],
            })(
              <DatePicker disabled={type === 'modify'} format='YYYY-MM-DD HH:mm:ss' />
            )}
          </FormItem>
          <FormItem label='结束时间'>
            {getFieldDecorator('endTime', {
              initialValue: initialValues ? moment(initialValues.endTime) : '',
              rules: [{ required: true }],
            })(
              <DatePicker disabled={type === 'modify'} format='YYYY-MM-DD HH:mm:ss' />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(WhiteCreateForm));
