/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
import React from 'react';
import {
  Form, Modal, Input,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import TenantSelect from '@pkgs/TenantSelect';

const FormItem = Form.Item;

interface Props {
  field: 'cate' | 'note' | 'tenant';
  onOk: (value: any) => void
}

function Batch(props: Props & ModalWrapProps &FormProps) {
  const intlFmtMsg = useFormatMessage();
  const {
    title, visible, destroy, field, onOk,
  } = props;
  const { getFieldDecorator, validateFields } = props.form!;
  const handleOk = () => {
    validateFields((err, values) => {
      if (!err) {
        onOk(values);
        destroy();
      }
    });
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={() => { handleOk(); }}
      onCancel={() => { destroy(); }}
    >
      <Form
        layout="vertical"
        onSubmit={(e) => {
          e.preventDefault();
          handleOk();
        }}
      >
        {
          field === 'cate' ?
            <FormItem label={intlFmtMsg({ id: 'nethws.cate' })}>
              {getFieldDecorator('cate', {
              })(
                <Input />,
              )}
            </FormItem> : null
        }
        {
          field === 'tenant' ?
            <FormItem label={intlFmtMsg({ id: 'hosts.tenant' })}>
              {getFieldDecorator('tenant', {
              })(
                <TenantSelect />,
              )}
            </FormItem> : null
          }
        {
          field === 'note' ?
            <FormItem label={intlFmtMsg({ id: 'nethws.note' })}>
              {getFieldDecorator('note', {
              })(
                <Input.TextArea />,
              )}
            </FormItem> : null
        }
      </Form>
    </Modal>
  );
}

export default ModalControl(Form.create()(Batch) as any);
