/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  Input, Modal, Form, Select, Tooltip, Icon, Button,
} from 'antd';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { FormProps } from 'antd/lib/form';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@pkgs/api';

interface Props {
  type: 'create' | 'modify',
  initialValues?: any,
  onOk: (values: any) => Promise<any>,
}

const FormItem = Form.Item;
const fetchRegion = () => request(`${api.nethw}/region`);

class NethwsForm extends Component<Props & ModalWrapProps & FormProps> {
  titleMap = {
    create: <FormattedMessage id="table.create" />,
    modify: <FormattedMessage id="table.modify" />,
  }

  state = {
    regions: [],
    loading: false,
  };

  componentDidMount() {
    fetchRegion().then((res) => {
      this.setState({ regions: res });
    });
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        this.props.onOk(values).then(() => {
          this.setState({ loading: false });
          this.props.destroy();
        });
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
        footer={[
          <Button key="back" onClick={this.handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={this.state.loading} onClick={this.handleOk}>
            Submit
          </Button>,
        ]}
      >
        <Form
          layout="vertical"
          onSubmit={(e) => {
            e.preventDefault();
            this.handleOk();
          }}
        >
          {
            type === 'create' ?
              <FormItem
                label={
                  <span>
                    <FormattedMessage id="nethws.ips" />
                    <Tooltip
                      overlayClassName="largeTooltip"
                      title={
                        <div style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                          支持3中添加方式
                          <br />
                          1.ip列表，样例
                          <br />
                          172.25.79.3
                          <br />
                          172.25.79.4
                          <br />
                          <br />
                          2.ip范围，样例
                          <br />
                          172.25.79.3-172.25.79.7
                          <br />
                          <br />
                          3.网段表示法，样例
                          <br />
                          172.25.79.3/24
                        </div>
                      }
                    >
                      <span style={{ paddingLeft: 5 }}><Icon type="info-circle-o" /></span>
                    </Tooltip>
                  </span>
                }
              >
                {getFieldDecorator('ips', {
                  initialValue: initialValues ? initialValues.ips : '',
                  rules: [{ required: true, message: '必填项！' }],
                })(
                  <Input.TextArea />,
                )}
              </FormItem> :
              <FormItem label={<FormattedMessage id="nethws.ip" />}>
                {getFieldDecorator('ip', {
                  initialValue: initialValues ? initialValues.ip : '',
                  rules: [{ required: true, message: '必填项！' }],
                })(
                  <Input />,
                )}
              </FormItem>
          }
          <FormItem label={<FormattedMessage id="nethws.cate" />}>
            {getFieldDecorator('cate', {
              initialValue: initialValues ? initialValues.cate : '',
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="nethws.snmp_version" />}>
            {getFieldDecorator('snmp_version', {
              initialValue: initialValues ? initialValues.snmp_version : '',
              rules: [{ required: true, message: '请选择！' }],
            })(
              <Select>
                <Select.Option value="1">1</Select.Option>
                <Select.Option value="2">2</Select.Option>
                <Select.Option value="3">3</Select.Option>
              </Select>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="nethws.auth" />}>
            {getFieldDecorator('auth', {
              initialValue: initialValues ? initialValues.auth : '',
              rules: [{ required: true, message: '必填项！' }],
            })(
              <Input.TextArea />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="nethws.region" />}>
            {getFieldDecorator('region', {
              initialValue: initialValues ? initialValues.region : '',
              rules: [{ required: true , message: '请选择！'}],
            })(
              <Select>
                {
                  _.map(this.state.regions, (region) => <Select.Option key={region} value={region}>{region}</Select.Option>)
                }
              </Select>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="nethws.note" />}>
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

export default ModalControl(Form.create()(NethwsForm));
