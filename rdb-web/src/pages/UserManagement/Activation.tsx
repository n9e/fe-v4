import React, { Component } from 'react';
import { Modal, message, Form, DatePicker, Radio, Row, Col } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import request from '@pkgs/request';
import api from '@pkgs/api';
import moment from 'moment';


const FormItem = Form.Item;

class Activation extends Component<ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    title: '',
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  state = {
    userType: 0,
    startTime: '', // 开始时间
    endTime: '', // 结束时间
  }

  handleOk = () => {
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        const active_begin = values.type === 1 ? new Date(values.active_begin).getTime() : null;
        const active_end = values.type === 1 ? new Date(values.active_end).getTime() : null;
        request(`${api.user}/${this.props.data.id}/profile`, {
          method: 'PUT',
          body: JSON.stringify({
            ...values,
            active_begin: active_begin,
            active_end: active_end
          }),
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


  // 开始时间选择器(监控记录日期变换)
  handleStartDateChange = (_value: any, dateString: string) => {
    this.setState({
      startTime: dateString,
    });
  };

  // 结束时间选择器(监控记录日期变换)
  handleEndDateChange = (_value: any, dateString: string) => {
    this.setState({
      endTime: dateString,
    });
  };

  // 结束时间可选范围
  handleEndDisabledDate = (current: any) => {
    const { startTime } = this.state;
    if (startTime !== '') {
      // 核心逻辑: 结束日期不能多余开始日期后90天，且不能早于开始日期
      return current > moment(startTime).add(90, 'day') || current < moment(startTime);
    } else {
      return null;
    }
  }

  // 开始时间可选范围
  handleStartDisabledDate = (current: any) => {
    const { endTime } = this.state;
    if (endTime !== '') {
      // 核心逻辑: 开始日期不能晚于结束日期，且不能早于结束日期前90天
      return current < moment(endTime).subtract(90, 'day') || current > moment(endTime);
    } else {
      return null;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form!;
    const { title, visible, data } = this.props;

    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label='账号类型' required>
            {getFieldDecorator('type', {
              initialValue: data.type,
              rules: [{ required: true, message:"必选项！" }],
            })(
              <Radio.Group onChange={(e) => this.setState({ userType: e.target.value })}>
                <Radio value={0}>长期账号</Radio>
                <Radio value={1}>临时账号</Radio>
              </Radio.Group>,
            )}
          </FormItem>
          {
            this.state.userType === 1 ?
              <Row>
                <Col span={10}>
                  <Form.Item label="账号生效时间" style={{height: 50}}>
                    <Col span={10}>
                      <Form.Item style={{ marginTop: '3px' }}>
                        {getFieldDecorator('active_begin', {
                          initialValue: moment(data.active_begin),
                          rules: [{ required: true, message:"必填项！" }],
                        })(
                          <DatePicker
                            onChange={this.handleStartDateChange}
                            disabledDate={this.handleStartDisabledDate}
                            placeholder="开始日期"
                          />)
                        }
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      <span style={{ display: 'inline-block', textAlign: 'center', paddingTop: 10 }}>-</span>
                    </Col>
                    <Col span={10}>
                      <Form.Item style={{ marginTop: '3px' }}>
                        {getFieldDecorator('active_end', {
                          initialValue: moment(data.active_end),
                          rules: [{ required: true, message:"必填项！" }],
                        })(
                          <DatePicker
                            onChange={this.handleEndDateChange}
                            disabledDate={this.handleEndDisabledDate}
                            placeholder="结束日期"
                          />)
                        }
                      </Form.Item>
                    </Col>
                  </Form.Item>
                </Col>
              </Row> : null
          }
        </Form>
      </Modal>
    );
  }
}

const Activa = Form.create()(Activation)
export default ModalControl(injectIntl(Activa) as any);
