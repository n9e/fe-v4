import React from 'react';
import { Form, Modal, Input, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { useDynamicList } from '@umijs/hooks'
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@common/api';

interface Props {
  values: any;
}

export default ModalControl(Form.create()((props: Props & FormComponentProps & ModalWrapProps) => {
  const { list, remove, getKey, push } = useDynamicList(['']);
  const { getFieldDecorator, validateFields } = props.form;

  const Row = (index: number, item: any) => (
    <Form.Item key={getKey(index)}>
      {getFieldDecorator(`emails[${getKey(index)}]`, {
        initialValue: item,
        rules: [
          {
            required: true,
            message: '必填项！',
          },
        ],
      })(<Input style={{ width: 400 }} placeholder="Please enter email" />)}
      {list.length > 1 && (
        <Icon
          type="minus-circle-o"
          style={{ marginLeft: 8 }}
          onClick={() => {
            remove(index);
          }}
        />
      )}
      <Icon
        type="plus-circle-o"
        style={{ marginLeft: 8 }}
        onClick={() => {
          push('');
        }}
      />
    </Form.Item>
  );

  return (
    <Modal
      title={<FormattedMessage id="smtp.test" />}
      visible={props.visible}
      onOk={() => {
        validateFields((err, val) => {
          console.log('val', val);
          if (!err) {
            request(`${api.configs}/smtp/test`, {
              method: 'POST',
              body: JSON.stringify({
                ...props.values,
                smtpPort: Number(props.values.smtpPort),
                targets: val.emails,
              }),
            }).then(() => {
              message.success('Test success');
              props.destroy();
            });
          }
        })
      }}
      onCancel={() => {
        props.destroy();
      }}
    >
      <Form>{list.map((ele, index) => Row(index, ele))}</Form>
    </Modal>
  );
}));
