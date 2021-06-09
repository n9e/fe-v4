import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Form, Button, Input, Radio, Tooltip, Icon, InputNumber, TreeSelect, Checkbox, Row, Col } from 'antd';
import _ from 'lodash';
import queryString from 'query-string';
import { FormattedMessage, injectIntl } from 'react-intl';
import { normalizeTreeData, renderTreeNodes, filterTreeNodes } from '@pkgs/Layout/utils';
import { services } from '@pkgs/Graph';
import { prefixCls } from '@common/config';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@common/api';
import { Expressions, Filters, Actions, PeriodTime, AlarmUpgrade, WorkGroups } from './SettingFields/';
import { processReqData } from './utils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class SettingFields extends Component {
  static contextType = NsTreeContext;

  static propTypes = {
    initialValues: PropTypes.object,
  };

  static defaultProps = {
    initialValues: {},
  };

  constructor(props) {
    super(props); 5
    this.state = {
      metrics: [],
      tags: {},
      nodeTags: {},
      treeData: [],
      excludeTreeData: [],
      notifyDataLoading: false,
      notifyGroupData: [],
      notifyUserData: [],
      advanced: false,
    };
    this.fetchNotifyData = _.throttle(this.fetchNotifyData, 300);
  }

  componentDidMount() {
    this.fetchTreeData();
    this.fetchMetrics.call(this, this.props.initialValues.category);
    this.fetchTagkvs(this.props.initialValues.exprs);
    // this.fetchNotifyData({
    //   ids: _.get(this.props.initialValues, 'notify_group')
    // }, {
    //   ids: _.get(this.props.initialValues, 'notify_user')
    // });
    this.fetchNotifyData();
  }

  fetchTreeData() {
    request(api.tree).then((res) => {
      this.setState({ treeData: res });
      const treeData = normalizeTreeData(res);
      this.setState({ treeData }, () => {
        if (this.props.initialValues.nid) {
          this.handleNsChange(this.props.initialValues.nid);
        }
      });
    });
  }

  async fetchMetrics(category = 1) {
    const { nid } = this.props.initialValues;
    let hosts = [];
    let metrics = [];
    try {
      hosts = await services.fetchEndPoints(nid);
      hosts = _.map(hosts, 'ident');
    } catch (e) {
      console.log(e);
    }
    const endpointsKey = category === 1 ? 'endpoints' : 'nids';
    const endpointsVal = category === 1 ? hosts : [_.toString(nid)];
    try {
      metrics = await request(category === 1 ? api.metrics : api.metricsPods, {
        method: 'POST',
        body: JSON.stringify({
          [endpointsKey]: endpointsVal,
        }),
      }).then((res) => {
        return res.metrics;
      });
    } catch (e) {
      console.log(e);
    }
    this.setState({ metrics });
  }

  async fetchTagkvs(strategyExpressionsValue) {
    if (!strategyExpressionsValue) return;
    // 历史原因只取第一个 expression.metric
    const firstExpression = strategyExpressionsValue[0] || {};
    const { metric = '' } = firstExpression;
    const { getFieldValue } = this.props.form;
    const { nid } = this.props.initialValues;
    const category = getFieldValue('category') || this.props.initialValues.category || 1;

    let hosts = [];
    try {
      hosts = await services.fetchEndPoints(nid);
      hosts = _.map(hosts, 'ident');
    } catch (e) {
      console.log(e);
    }

    const endpointsKey = category === 1 ? 'endpoints' : 'nids';
    const endpointsVal = category === 1 ? hosts : [_.toString(nid)];

    if (nid && metric && this.currentMetric !== metric) {
      request(api.tagkv, {
        method: 'POST',
        body: JSON.stringify({
          [endpointsKey]: endpointsVal,
          metrics: [metric],
        }),
      }).then((data) => {
        const tagkvsraw = _.sortBy(data.length > 0 ? data[0].tagkv : [], 'tagk');
        const tagkvs = {};

        _.each(tagkvsraw, (v) => {
          if (v && v.tagk && v.tagv) {
            tagkvs[v.tagk] = _.sortBy(v.tagv);
          }
        });
        this.currentMetric = metric;
        this.setState({
          tags: tagkvs,
        });
      });
    }
  }

  async fetchNotifyData(params = {}, params2 = {}) {
    this.setState({ notifyDataLoading: true });
    try {
      const teamData = await request(`${api.teams}/all?${queryString.stringify({ limit: 50, ...params })}`);
      const userData = await request(`${api.users}?${queryString.stringify({ limit: 50, ...params2 })}`);
      this.setState({
        notifyGroupData: teamData.list,
        notifyUserData: userData.list,
      });
    } catch (e) {
      console.log(e);
    }
    this.setState({ notifyDataLoading: false });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        console.log('Errors in form!!!', errors);
        return;
      }
      this.props.onSubmit(processReqData(values));
    });
  }

  handleExpressionsChange = (val) => {
    this.fetchTagkvs(val);
  }

  handleNsChange = (value) => {
    const excludeTreeData = filterTreeNodes(this.state.treeData, value);
    this.setState({ excludeTreeData });
  }

  render() {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };

    getFieldDecorator('category', {
      initialValue: 1,
    });

    return (
      <Form className={`${prefixCls}-strategy-form`} layout="horizontal" onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.name" />}
        >
          {
            getFieldDecorator('name', {
              initialValue: this.props.initialValues.name,
              rules: [{
                required: true, message: '必填项！',
              }],
            })(
              <Input />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="host.is.related" />}
        >
          {
            getFieldDecorator('category', {
              initialValue: this.props.initialValues.category || 1,
              rules: [{
                required: true, message: '必填项！',
              }],
              onChange: (e) => {
                this.fetchMetrics(e.target.value);
              },
            })(
              <Radio.Group>
                <Radio value={1}><FormattedMessage id="host.related" /></Radio>
                <Radio value={2}><FormattedMessage id="host.unRelated" /></Radio>
              </Radio.Group>,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.node" />}
        >
          {
            getFieldDecorator('nid', {
              initialValue: this.props.initialValues.nid,
              onChange: (value) => {
                this.handleNsChange(value);
                setFieldsValue({
                  exclude_nid: [],
                });
              },
            })(
              <TreeSelect
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.treeData, 'treeSelect')}
              </TreeSelect>,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.node.exclude" />}
        >
          {
            getFieldDecorator('excl_nid', {
              initialValue: this.props.initialValues.excl_nid,
            })(
              <TreeSelect
                multiple
                showSearch
                allowClear
                treeDefaultExpandAll
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.excludeTreeData, 'treeSelect')}
              </TreeSelect>,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.nodeTag" />}
        >
          {
            getFieldDecorator('node_tags', {
              initialValue: this.props.initialValues.node_tags || [],
            })(
              <Filters
              // tags={this.state.nodeTags}
              />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={
            <Tooltip title={
              <div>
                <FormattedMessage id="stra.priority.1.tip" /><br />
                <FormattedMessage id="stra.priority.2.tip" /><br />
                <FormattedMessage id="stra.priority.3.tip" />
              </div>
            }>
              <span><FormattedMessage id="stra.priority" /> <Icon type="info-circle-o" /></span>
            </Tooltip>
          }
          required
        >
          {
            getFieldDecorator('priority', {
              initialValue: this.props.initialValues.priority || 3,
            })(
              <RadioGroup size="default">
                {
                  _.map({
                    1: {
                      alias: <FormattedMessage id="stra.priority.1" />,
                      color: 'red',
                    },
                    2: {
                      alias: <FormattedMessage id="stra.priority.2" />,
                      color: 'yellow',
                    },
                    3: {
                      alias: <FormattedMessage id="stra.priority.3" />,
                      color: 'blue',
                    },
                  }, (val, key) => {
                    return <Radio key={key} value={Number(key)}>{val.alias}</Radio>;
                  })
                }
              </RadioGroup>,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.alertDur" />}
        >
          {
            getFieldDecorator('alert_dur', {
              initialValue: this.props.initialValues.alert_dur !== undefined ? this.props.initialValues.alert_dur : 180,
            })(
              <InputNumber min={0} />,
            )
          }
          <FormattedMessage id="stra.seconds" />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.trigger" />}
          validateStatus="success" // 兼容
          help="" // 兼容
        >
          {
            getFieldDecorator('exprs', {
              initialValue: this.props.initialValues.exprs || [Expressions.defaultExpressionValue],
              onChange: this.handleExpressionsChange,
              rules: [{
                validator: Expressions.checkExpressions,
              }],
            })(
              <Expressions
                alertDuration={getFieldValue('alert_dur')}
                headerExtra={<div>headerExtra</div>}
                metrics={this.state.metrics}
              />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.tag" />}
        >
          {
            getFieldDecorator('tags', {
              initialValue: this.props.initialValues.tags || [],
            })(
              <Filters
                tags={this.state.tags}
              />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="stra.action" />}
          validateStatus="success" // 兼容
          help="" // 兼容
        >
          {
            getFieldDecorator('action', {
              initialValue: this.props.initialValues.action || Actions.defaultValue,
              rules: [{
                validator: Actions.checkActions,
              }],
            })(
              <Actions
                loading={this.state.notifyDataLoading}
                notifyGroupData={this.state.notifyGroupData}
                notifyUserData={this.state.notifyUserData}
                // eslint-disable-next-line react/jsx-no-bind
                fetchNotifyData={this.fetchNotifyData.bind(this)}
              />,
            )
          }
        </FormItem>
        <Row style={{ marginBottom: 10 }}>
          <Col offset={4}>
            <a
              onClick={() => {
                this.setState({ advanced: !this.state.advanced });
              }}
            ><FormattedMessage id="stra.advanced" /> <Icon type={this.state.advanced ? 'up' : 'down'} />
            </a>
          </Col>
        </Row>
        <div style={{ display: this.state.advanced ? 'block' : 'none' }}>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="stra.recovery.dur" />}
          >
            {
              getFieldDecorator('recovery_dur', {
                initialValue: this.props.initialValues.recovery_dur !== undefined ? this.props.initialValues.recovery_dur : 0,
              })(
                <InputNumber min={0} />,
              )
            }
            <FormattedMessage id="stra.seconds" /> (
            <FormattedMessage id="stra.recovery.dur.help.1" /> {getFieldValue('recovery_dur')} <FormattedMessage id="stra.recovery.dur.help.2" /> )
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="stra.recovery.notify" />}
          >
            {
              getFieldDecorator('recovery_notify', {
                initialValue: this.props.initialValues.recovery_notify === undefined ? false : !this.props.initialValues.recovery_notify,
                valuePropName: 'checked',
              })(
                <Checkbox>
                  <FormattedMessage id="stra.recovery.notify.checkbox" />
                </Checkbox>,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="stra.period.time" />}
          >
            {
              getFieldDecorator('period_time', {
                initialValue: this.props.initialValues.period_time || PeriodTime.defaultValue,
              })(
                <PeriodTime />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="stra.alert.upgrade" />}
            validateStatus="success" // 兼容
            help="" // 兼容
          >
            {
              getFieldDecorator('alert_upgrade', {
                initialValue: this.props.initialValues.alert_upgrade || AlarmUpgrade.defaultValue,
                rules: [{
                  validator: AlarmUpgrade.checkAlarmUpgrade,
                }],
              })(
                <AlarmUpgrade
                  loading={this.state.notifyDataLoading}
                  notifyGroupData={this.state.notifyGroupData}
                  notifyUserData={this.state.notifyUserData}
                  // eslint-disable-next-line react/jsx-no-bind
                  fetchNotifyData={this.fetchNotifyData.bind(this)}
                />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="stra.runbook" />}
            validateStatus="success" // 兼容
            help="" // 兼容
          >
            {
              getFieldDecorator('runbook', {
                initialValue: this.props.initialValues.runbook,
              })(
                <Input />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="stra.work_groups" />}
            validateStatus="success" // 兼容
            help="" // 兼容
          >
            {
              getFieldDecorator('work_groups', {
                initialValue: this.props.initialValues.work_groups || undefined,
              })(
                <WorkGroups />,
              )
            }
          </FormItem>
        </div>
        <FormItem wrapperCol={{ span: 16, offset: 4 }} style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit"><FormattedMessage id="form.submit" /></Button>
          <Button
            style={{ marginLeft: 8 }}
          >
            <Link to={{ pathname: '/strategy' }}>返回</Link>
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(injectIntl(SettingFields));
