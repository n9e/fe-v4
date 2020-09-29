import React, { Component } from 'react';
import {
  Modal, Form, Input, Select, message,
} from 'antd';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl from '@pkgs/ModalControl';

const FormItem = Form.Item;

class SingleModifyHost extends Component<WrappedComponentProps & FormProps> {
  static defaultProps = {
    type: '',
    title: '',
    url: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  state = {
    tenantData: [],
  }

  componentDidMount() {
    this.fetchTenantData();
  }

  fetchTenantData() {
    this.request(`${this.api.tenant}?limit=1000`).then((res) => {
      const data = res.list || [];
      this.setState({ tenantData: data });
    });
  }

  handleOk = () => {
    const { title, url } = this.props;
    this.props.form!.validateFields((err, values) => {
      if (!err && url) {
        this.request(url, {
          method: 'PUT',
          body: JSON.stringify(values),
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
    const {
      type, title, visible, data, intl,
    } = this.props;
    const { getFieldDecorator } = this.props.form!;

    getFieldDecorator('id', {
      initialValue: data.id,
    });
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
          <FormItem label="SN">
            {getFieldDecorator('sn', {
              initialValue: data.sn,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="IP">
            {getFieldDecorator('ip', {
              initialValue: data.ip,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={intl.formatMessage({ id: 'host.name' })}>
            { getFieldDecorator('name', {
              initialValue: data.name,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="CPU">
            {getFieldDecorator('cpu', {
              initialValue: data.cpu,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="MEM">
            {getFieldDecorator('mem', {
              initialValue: data.mem,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="Disk">
            {getFieldDecorator('disk', {
              initialValue: data.disk,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label="Cate">
            {getFieldDecorator('cate', {
              initialValue: data.cate,
            })(
              <Input />,
            )}
          </FormItem>
          {
            type === 'admin'
              ? (
                <FormItem label={intl.formatMessage({ id: 'host.tenant' })}>
                  {getFieldDecorator('tenant', {
                    initialValue: data.tenant,
                  })(
                    <Select>
                      {
                      _.map(this.state.tenantData, (item) => <Select.Option key={item.ident} value={item.ident}>{item.ident}</Select.Option>)
                    }
                    </Select>,
                  )}
                </FormItem>
              ) : null
          }
          <FormItem label={intl.formatMessage({ id: 'host.note' })}>
            {getFieldDecorator('note', {
              initialValue: data.note,
            })(
              <Input />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Form.create()(SingleModifyHost)) as any);
