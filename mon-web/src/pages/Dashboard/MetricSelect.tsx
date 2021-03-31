import React, { Component } from 'react';
import {
  Card, Input, Tabs, Tooltip, Spin, Select,
} from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'react-intl';
import { services } from '@pkgs/Graph';
import { prefixCls, metricMap, metricsMeta } from './config';
import { filterMetrics, matchMetrics } from './utils';

const { TabPane } = Tabs;
const { Option } = Select;
function getCurrentMetricMeta(metric: string) {
  if (metricsMeta[metric]) {
    return metricsMeta[metric];
  }
  let currentMetricMeta;
  _.each(metricsMeta, (val, key) => {
    if (key.indexOf('$Name') > -1) {
      const keySplit = key.split('$Name');
      if (metric.indexOf(keySplit[0]) === 0 && metric.indexOf(keySplit[1]) > 0) {
        currentMetricMeta = val;
      }
    }
  });
  return currentMetricMeta;
}
function getSelectedMetricsLen(metric: string, selectedMetrics: string) {
  const filtered = _.filter(selectedMetrics, o => o === metric);
  if (filtered.length) {
    return <span style={{ color: '#999' }}> +{filtered.length}</span>;
  }
  return null;
}

class MetricSelect extends Component<any, any> {
  static defaultProps = {
    nid: undefined,
    hosts: [],
    selectedHosts: [],
    metrics: [],
    selectedMetrics: [],
    onSelect: () => {},
  };

  constructor(props: any) {
    super(props);
    this.state = {
      searchValue: '',
      activeKey: 'ALL',
      metricTipVisible: {},
    };
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.endpointsKey === 'nids') {
      this.setState({ activeKey: 'ALL' });
    }
  }

  normalizMetrics(key: string) {
    const { metrics } = this.props;
    let newMetrics = _.cloneDeep(metrics);
    if (key !== 'ALL') {
      const { filter, data } = metricMap[key];
      if (filter && filter.type && filter.value) {
        return filterMetrics(filter.type, filter.value, metrics);
      } else if (data && data.length !== 0) {
        newMetrics = matchMetrics(data, metrics);
        return _.concat([], newMetrics);
      }
      return [];
    }
    return newMetrics;
  }

  dynamicMetricMaps() {
    const { metrics } = this.props;
    return _.filter(metricMap, (val) => {
      const { dynamic, filter } = val;
      if (!dynamic) return true;
      if (filter && filter.type && filter.value) {
        const newMetrics = filterMetrics(filter.type, filter.value, metrics);
        if (newMetrics && newMetrics.length !== 0) {
          return true;
        }
        return false;
      }
      return false;
    });
  }

  handleMetricsSearch = (e: any) => {
    const { value } = e.target;
    this.setState({ searchValue: value });
  }

  handleMetricTabsChange = (key: string) => {
    this.setState({ activeKey: key });
  }

  handleMetricClick = async (metric: string) => {
    const {
      nid, onSelect, hosts, selectedHosts, endpointsKey,
      indexLastHours,
    } = this.props;
    const now = moment();
    const tagkv = await services.fetchTagkv(endpointsKey === 'endpoints' ? selectedHosts : [_.toString(nid)], metric, hosts, endpointsKey, indexLastHours);
    const selectedTagkv = _.cloneDeep(tagkv);
    const endpointTagkv = _.find(selectedTagkv, { tagk: 'endpoint' });
    const nids = _.get(_.find(tagkv, { tagk: 'nids' }), 'tagv', []);
    if (endpointTagkv) endpointTagkv.tagv = selectedHosts;
    const newGraphConfig = {
      now: now.clone().format('x'),
      start: now.clone().subtract(3600000, 'ms').format('x'),
      end: now.clone().format('x'),
      indexLastHours,
      metrics: [{
        selectedNid: nid,
        selectedEndpoint: endpointsKey === 'endpoints' ? selectedHosts : nids,
        endpoints: endpointsKey === 'endpoints' ? hosts : nids,
        selectedMetric: metric,
        selectedTagkv,
        tagkv,
        aggrFunc: undefined,
        counterList: [],
        endpointsKey,
      }],
    };
    onSelect({
      ...newGraphConfig,
    });
  }

  renderMetricList(metrics = [], metricTabKey: string) {
    const { selectedMetrics } = this.props;
    return (
      <div className="tabPane">
        {
          metrics.length ?
            <ul className="ant-menu ant-menu-vertical ant-menu-root" style={{ border: 'none' }}>
              {
                _.map(metrics, (metric, i) => {
                  return (
                    <li className="ant-menu-item" key={i} onClick={() => { this.handleMetricClick(metric); }}>
                      <Tooltip
                        key={`${metricTabKey}_${metric}`}
                        placement="right"
                        visible={this.state.metricTipVisible[`${metricTabKey}_${metric}`]}
                        title={() => {
                          const currentMetricMeta = getCurrentMetricMeta(metric);
                          if (currentMetricMeta) {
                            return (
                              <div>
                                <p>含义：{currentMetricMeta.meaning}</p>
                                <p>单位：{currentMetricMeta.unit}</p>
                              </div>
                            );
                          }
                          return '';
                        }}
                        onVisibleChange={(visible) => {
                          const key = `${metricTabKey}_${metric}`;
                          const currentMetricMeta = getCurrentMetricMeta(metric);
                          const { metricTipVisible } = this.state;
                          if (visible && currentMetricMeta) {
                            metricTipVisible[key] = true;
                          } else {
                            metricTipVisible[key] = false;
                          }
                          this.setState({
                            metricTipVisible,
                          });
                        }}
                      >
                        <span>{metric}</span>
                      </Tooltip>
                      {getSelectedMetricsLen(metric, selectedMetrics)}
                    </li>
                  );
                })
              }
            </ul> :
            <div style={{ textAlign: 'center' }}>No data</div>
        }
      </div>
    );
  }

  renderMetricTabs() {
    const { locale } = this.props.intl;
    const { searchValue, activeKey } = this.state;
    const metrics = this.normalizMetrics(activeKey);
    let newMetrics = metrics;
    if (searchValue) {
      try {
        const reg = new RegExp(searchValue, 'i');
        newMetrics = _.filter(metrics, (item) => {
          return reg.test(item);
        });
      } catch (e) {
        newMetrics = [];
      }
    }
    const newMetricMap = this.dynamicMetricMaps();
    const tabPanes = _.map(newMetricMap, (val) => {
      const tabName = locale == 'zh' ? val.alias : val.key;
      return (
        <TabPane tab={tabName} key={val.key}>
          { this.renderMetricList(newMetrics, val.key) }
        </TabPane>
      );
    });
    tabPanes.unshift(
      <TabPane tab={<FormattedMessage id="graph.metric.list.all" />} key="ALL">
        { this.renderMetricList(newMetrics, 'ALL') }
      </TabPane>,
    );

    return (
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={this.handleMetricTabsChange}
      >
        {tabPanes}
      </Tabs>
    );
  }

  render() {
    const { loading, indexLastHours, onIndexLastHoursChange } = this.props;
    return (
      <Spin spinning={loading}>
        <Card
          className={`${prefixCls}-card`}
          title={(
            <span className={`${prefixCls}-metrics-title`}>
              <span><FormattedMessage id="graph.metric.list.title" /></span>
              <Input
                size="small"
                placeholder="请输入指标名称"
                onChange={this.handleMetricsSearch}
              />
            </span>
          )}
          extra={(
            <span>
              索引查询：
              <Select
                size="small"
                style={{ width: 110 }}
                value={indexLastHours}
                onChange={(val: number) => {
                  onIndexLastHoursChange(val);
                }}
              >
                <Option value={2}>最近 2 小时</Option>
                <Option value={6}>最近 6 小时</Option>
                <Option value={12}>最近 12 小时</Option>
                <Option value={24}>最近 24 小时</Option>
                <Option value={48}>最近 48 小时</Option>
                <Option value={72}>最近 72 小时</Option>
              </Select>
            </span>
          )}
        >
          {this.renderMetricTabs()}
        </Card>
      </Spin>
    );
  }
}

export default injectIntl(MetricSelect);
