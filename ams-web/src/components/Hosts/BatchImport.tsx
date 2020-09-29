import React, { Component } from 'react';
import {
  Modal, Form, Input, message,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@pkgs/api';

interface Props {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  destroy: () => void;
}

const FormItem = Form.Item;
const defaultValue = ["x::y::z"];

class BatchImport extends Component<Props & WrappedComponentProps & FormProps> {
  static defaultProps = {
    title: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  handleOk = () => {
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        request(api.hosts, {
          method: 'POST',
          body: JSON.stringify(_.split(values.hosts, '\n')),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'hosts.batch.import.success' }));
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
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'hosts.batch.import' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem
            label=""
            help={this.props.intl.formatMessage({ id: 'hosts.batch.import.help' })}
          >
            {getFieldDecorator('hosts', {
              rules: [{ required: true }],
              initialValue: defaultValue.join('\n'),
            })(
              <Input.TextArea
                autoSize={{ minRows: 5, maxRows: 10 }}
              />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(BatchImport) as any) as any);
