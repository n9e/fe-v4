import React, { Component } from 'react';
import {
  Modal, Form, Input, message,
} from 'antd';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import TenantSelect from '@pkgs/TenantSelect';

const FormItem = Form.Item;

class BatchModifyHost extends Component<any> {
  static defaultProps: any = {
    field: 'note', // 'note' | 'tenant' | 'cate'
    otherBody: {},
    selected: [],
    title: '',
    url: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    const { selected, url, otherBody } = this.props;
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err && url) {
        const reqBody = {
          ...values,
          ...otherBody,
          ids: _.map(selected, 'id'),
        };
        request(url, {
          method: 'PUT',
          body: JSON.stringify(reqBody),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
          this.props.onOk();
          this.props.destroy();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { title, visible, intl, selected, field } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={title}
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
          {
            field === 'note' ?
              <FormItem label={intl.formatMessage({ id: 'hosts.note' })}>
                {getFieldDecorator('note', {
                  initialValue: selected.length === 1 ? _.get(selected, '[0].note') : ''
                })(
                  <Input />,
                )}
              </FormItem> : null
          }
          {
            field === 'cate' ?
              <FormItem label={intl.formatMessage({ id: 'hosts.cate' })}>
                {getFieldDecorator('cate', {
                  initialValue: selected.length === 1 ? _.get(selected, '[0].cate') : ''
                })(
                  <Input />,
                )}
              </FormItem> : null
          }
          {
            field === 'tenant' ?
              <FormItem label={intl.formatMessage({ id: 'hosts.tenant' })}>
                {getFieldDecorator('tenant', {
                  initialValue: selected.length === 1 ? _.get(selected, '[0].tenant') : ''
                })(
                  <TenantSelect type="all" />,
                )}
              </FormItem> : null
          }
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(BatchModifyHost)) as any);
