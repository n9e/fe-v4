/* eslint-disable class-methods-use-this */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Input, DatePicker, Radio, Select, TreeSelect } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { services } from '@pkgs/Graph';
import request from '@pkgs/request';
import api from '@common/api';
import { normalizeTreeData, renderTreeNodes, filterTreeNodes } from '@pkgs/Layout/utils';

const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const timeFormatMap = {
  antd: 'YYYY-MM-DD HH:mm:ss',
  moment: 'YYYY-MM-DD HH:mm:ss',
};
const shortcutBar = [
  { label: '1小时', value: 3600 },
  { label: '2小时', value: 7200 },
  { label: '6小时', value: 21600 },
  { label: '12小时', value: 43200 },
  { label: '1天', value: 86400 },
  { label: '2天', value: 172800 },
  { label: '7天', value: 604800 },
];

class CustomForm extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    initialValues: PropTypes.object,
  };

  static defaultProps = {
    readOnly: false,
    initialValues: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      metrics: [],
    };
  }

  componentDidMount = () => {
    const { initialValues } = this.props;
    this.fetchMetrics(initialValues.category);
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

  checkTags(rule, value, callback) {
    if (value) {
      const currentTag = _.get(value, '[0]', {});
      if (!currentTag.tkey || _.isEmpty(currentTag.tval)) {
        callback('tags is required');
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  updateSilenceTime(val) {
    const { setFieldsValue } = this.props.form;
    const now = moment();
    const beginTs = now.clone();
    const endTs = now.clone().add(val, 'seconds');

    setFieldsValue({ btime: beginTs });
    setFieldsValue({ etime: endTs });
  }

  renderTimeOptions() {
    const { readOnly } = this.props;
    const { getFieldValue } = this.props.form;
    const beginTs = getFieldValue('btime');
    const endTs = getFieldValue('etime');
    let timeSpan;

    if (beginTs && endTs) {
      timeSpan = endTs.unix() - beginTs.unix();
    }

    if (readOnly) {
      return null;
    }
    return (
      <ButtonGroup
        size="default"
      >
        {
          _.map(shortcutBar, o => (
            <Button
              onClick={() => { this.updateSilenceTime(o.value); }}
              key={o.value}
              type={o.value === timeSpan ? 'primary' : undefined}
            >
              <FormattedMessage id={o.label} />
            </Button>
          ))
        }
      </ButtonGroup>
    );
  }

  render() {
    const { readOnly, initialValues, treeData } = this.props;
    const { metrics } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const ns = _.get(_.find(treeData, { id: initialValues.nid }), 'path');

    return (
      <div className="alarm-shielding-form">
        <Form className={readOnly ? 'readOnly' : ''}>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="生效节点" />}
          >
            {ns}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="host.is.related" />}
          >
            {
              getFieldDecorator('category', {
                initialValue: initialValues.category || 1,
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
            label={<FormattedMessage id="silence.form.metric" />}
          >
            {getFieldDecorator('metric', {
              initialValue: initialValues.metric,
              rules: [
                // { required: true, message: '必填项！' },
              ],
            })(
              <Select
                disabled={readOnly}
                mode="combobox"
                notFoundContent=""
                size="default"
                style={{ width: '100%' }}
                placeholder="Metric name"
                defaultActiveFirstOption={false}
                dropdownMatchSelectWidth={false}
                showSearch
              >
                {
                  _.map(metrics, item => <Select.Option key={item} value={item}>{item}</Select.Option>)
                }
              </Select>,
            )}
          </FormItem>
          {
            getFieldValue('category') === 1 ?
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="silence.form.endpoints" />}
              >
                {getFieldDecorator('endpoints', {
                  initialValue: _.isArray(initialValues.endpoints) ? _.join(initialValues.endpoints, '\n') : initialValues.endpoints,
                  rules: [
                    { required: true, message: '必填项！' },
                  ],
                })(
                  <TextArea
                    autosize={{ minRows: 2, maxRows: 6 }}
                    disabled={readOnly}
                    placeholder="One endpoint per line"
                  />,
                )}
              </FormItem> :
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="屏蔽节点" />}
              >
                {getFieldDecorator('curNidPaths', {
                  initialValue: _.map(initialValues.cur_nid_paths, val => val),
                  rules: [
                    { required: true, message: '必填项！' },
                  ],
                })(
                  <TreeSelect
                    disabled={readOnly}
                    multiple
                    showSearch
                    allowClear
                    treeDefaultExpandAll
                    treeNodeFilterProp="path"
                    treeNodeLabelProp="path"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  >
                    {renderTreeNodes(filterTreeNodes(normalizeTreeData(treeData), initialValues.nid), 'treeSelect')}
                  </TreeSelect>,
                )}
              </FormItem>
          }
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="silence.form.tags" />}
            help="eg. key1=value1,key2=value2"
          >
            {getFieldDecorator('tags', {
              initialValue: initialValues.tags,
            })(
              <TextArea
                autosize={{ minRows: 2, maxRows: 6 }}
                disabled={readOnly}
              />,
            )}
          </FormItem>
          <FormItem
            wrapperCol={{ span: 14, offset: 6 }}
          >
            {this.renderTimeOptions()}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="silence.form.stime" />}
          >
            {getFieldDecorator('btime', {
              initialValue: moment.unix(initialValues.btime),
              rules: [
                { required: true, message: '必填项！' },
              ],
            })(
              <DatePicker
                showTime
                format={timeFormatMap.antd}
                disabled={readOnly}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="silence.form.etime" />}
          >
            {getFieldDecorator('etime', {
              initialValue: moment.unix(initialValues.etime),
              rules: [
                { required: true, message: '必填项！' },
              ],
            })(
              <DatePicker
                showTime
                format={timeFormatMap.antd}
                disabled={readOnly}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="silence.cause" />}
          >
            {getFieldDecorator('cause', {
              initialValue: initialValues.cause,
              rules: [
                { required: true, message: '必填项！' },
              ],
            })(
              <TextArea
                autosize={{ minRows: 2, maxRows: 6 }}
                disabled={readOnly}
              />,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(CustomForm);
