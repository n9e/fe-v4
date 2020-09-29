import React, { Component } from 'react';
import update from 'react-addons-update';
import { Layout, Row, Col } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { config as graphConfig, GlobalOperationbar, services } from '@pkgs/Graph';
import HostSelect from '@pkgs/HostSelect';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@pkgs/api';
import MetricSelect from './MetricSelect';
import Graphs from './Graphs';
import { prefixCls, baseMetrics } from './config';
import SubscribeModal from './SubscribeModal';
import { normalizeGraphData } from './utils';
import './style.less';

const { Content } = Layout;
function getSelectedMetrics(graphs: any) {
  const selectedMetrics = [] as string[];
  _.forEach(graphs, (graph) => {
    _.forEach(graph.metrics, (metric) => {
      selectedMetrics.push(metric.selectedMetric);
    });
  });
  return selectedMetrics;
}

class MonitorDashboard extends Component<any, any> {
  static contextType = NsTreeContext;
  allHostsMode = false;
  onceLoad = false;
  sidebarWidth = 200;
  constructor(props: any) {
    super(props);
    const now = moment();
    this.allHostsMode = false;
    this.onceLoad = false;
    this.state = {
      graphs: [],
      metricsLoading: false,
      metrics: [],
      hostsLoading: false,
      hosts: [],
      habitsId: 'ip',
      selectedHosts: props.selectedHosts,
      globalOptions: {
        now: now.clone().format('x'),
        start: now.clone().subtract(3600000, 'ms').format('x'),
        end: now.clone().format('x'),
        comparison: [],
      },
      endpointsKey: 'endpoints', // endpoints | nids
    };
  }

  componentDidMount = async () => {
    const { selectedHosts } = this.state;
    const metrics = await this.fetchMetrics(selectedHosts);
    this.setState({ metrics });
  }

  componentWillReceiveProps = async (nextProps: any) => {
    if (!_.isEqual(this.props.selectedHosts, nextProps.selectedHosts)) {
      const metrics = await this.fetchMetrics(nextProps.selectedHosts);
      this.setState({ metrics, selectedHosts: nextProps.selectedHosts });
    }
  }

  async fetchMetrics(selectedHosts: string[], hosts = [], nids?: string[]) {
    const { endpointsKey } = this.state;
    let metrics = [];
    if (!_.isEmpty(selectedHosts) || !_.isEmpty(nids)) {
      try {
        this.setState({ metricsLoading: true });
        metrics = await services.fetchMetrics(endpointsKey === 'endpoints' ? selectedHosts : nids, hosts, endpointsKey);
      } catch (e) {
        console.log(e);
      }
      this.setState({ metricsLoading: false });
    }
    return metrics;
  }

  async processBaseMetrics() {
    const { getSelectedNode } = this.context;
    const { selectedHosts, hosts, habitsId } = this.state;
    const selectedTreeNode = getSelectedNode();
    const nid = _.get(selectedTreeNode, 'id');
    const now = moment();
    const newGraphs = [];

    for (let i = 0; i < baseMetrics.length; i++) {
      const tagkv = await services.fetchTagkv(selectedHosts, baseMetrics[i], _.map(hosts, habitsId));
      const selectedTagkv = _.cloneDeep(tagkv);
      const endpointTagkv = _.find(selectedTagkv, { tagk: 'endpoint' });
      endpointTagkv.tagv = selectedHosts;

      newGraphs.push({
        id: Number(_.uniqueId()),
        now: now.clone().format('x'),
        start: now.clone().subtract(3600000, 'ms').format('x'),
        end: now.clone().format('x'),
        metrics: [{
          selectedNid: nid,
          selectedEndpoint: selectedHosts,
          endpoints: _.map(hosts, habitsId),
          selectedMetric: baseMetrics[i],
          selectedTagkv,
          tagkv,
          aggrFunc: undefined,
          counterList: [],
        }],
      });

      this.setState({ graphs: newGraphs });
    }
  }

  handleGraphConfigSubmit = (type: string, data: any, id?: number) => {
    const { graphs } = this.state;
    const graphsClone = _.cloneDeep(graphs);
    const ldata = _.cloneDeep(data) || {};

    if (type === 'push') {
      this.setState(update(this.state, {
        graphs: {
          $push: [{
            ...graphConfig.graphDefaultConfig,
            id: Number(_.uniqueId()),
            ...ldata,
          }],
        },
      }));
    } else if (type === 'unshift') {
      this.setState({
        graphs: update(graphsClone, {
          $unshift: [{
            ...graphConfig.graphDefaultConfig,
            id: Number(_.uniqueId()),
            ...ldata,
          }],
        }),
      });
    } else if (type === 'update' && id) {
      this.handleUpdateGraph('update', id, {
        ...ldata,
      });
    }
  }

  handleUpdateGraph = (type: string, id: number, updateConf: any, cbk = () => {}) => {
    const { graphs } = this.state;
    const index = _.findIndex(graphs, { id });
    if (type === 'allUpdate') {
      this.setState({
        graphs: updateConf,
      });
    } else if (type === 'update') {
      const currentConf = _.find(graphs, { id });
      this.setState(update(this.state, {
        graphs: {
          $splice: [
            [index, 1, {
              ...currentConf,
              ...updateConf,
            }],
          ],
        },
      }), () => {
        if (cbk) cbk();
      });
    } else if (type === 'delete') {
      this.setState(update(this.state, {
        graphs: {
          $splice: [
            [index, 1],
          ],
        },
      }));
    }
  }

  handleBatchUpdateGraphs = (updateConf: any) => {
    const { graphs } = this.state;
    const newPureGraphConfigs = _.map(graphs, (item) => {
      return {
        ...item,
        ...updateConf,
      };
    });

    this.setState({
      graphs: [...newPureGraphConfigs],
    });
  }

  handleSubscribeGraphs = () => {
    const configsList = _.map(this.state.graphs, (item) => {
      const data = normalizeGraphData(item);
      return JSON.stringify(data);
    });
    SubscribeModal({
      selectedNid: _.get(this.context, 'data.selectedNode.id'),
      configsList,
    });
  }

  handleShareGraphs = () => {
    const configsList = _.map(this.state.graphs, (item) => {
      const data = normalizeGraphData(item);
      return {
        configs: JSON.stringify(data),
      };
    });
    request(api.tmpchart, {
      method: 'POST',
      body: JSON.stringify(configsList),
    }).then((res) => {
      window.open(`/mon/tmpchart?id=${_.join(res, ',')}`, '_blank');
    });
  }

  handleRemoveGraphs = () => {
    this.setState({ graphs: [] });
  }

  render() {
    const {
      hosts,
      habitsId,
      selectedHosts,
      metricsLoading,
      metrics,
      graphs,
      globalOptions,
    } = this.state;
    const selectedTreeNode = _.get(this.context, 'data.selectedNode.id');
    if (!this.allHostsMode && !selectedTreeNode) {
      return (
        <div>
          <FormattedMessage id="node.select.help" />
        </div>
      );
    }

    return (
      <div className={prefixCls}>
        <Layout style={{ height: '100%', position: 'relative' }}>
          <Content>
            <Row gutter={10}>
              <Col span={8}>
                <HostSelect
                  optionKey="ident"
                  optionValueKey="id"
                  value={this.props.selectedHosts[0]}
                  onChange={this.props.onSelectedHostsChange}
                  style={{
                    width: '100%',
                    marginBottom: 10
                  }}
                />
                <MetricSelect
                  nid={selectedTreeNode}
                  loading={metricsLoading}
                  hosts={_.map(hosts, habitsId)}
                  selectedHosts={selectedHosts}
                  metrics={metrics}
                  selectedMetrics={getSelectedMetrics(graphs)}
                  onSelect={(data: any) => {
                    this.handleGraphConfigSubmit('unshift', data);
                  }}
                  endpointsKey={this.state.endpointsKey}
                />
              </Col>
              <Col span={16}>
                <div style={{ marginBottom: 10 }}>
                  <GlobalOperationbar
                    {...globalOptions}
                    onChange={(obj: any) => {
                      this.setState({
                        globalOptions: {
                          ...this.state.globalOptions,
                          ...obj,
                        },
                      }, () => {
                        this.handleBatchUpdateGraphs(obj);
                      });
                    }}
                  />
                </div>
                <Graphs
                  value={graphs}
                  onChange={this.handleUpdateGraph}
                  onGraphConfigSubmit={this.handleGraphConfigSubmit}
                  onUpdateGraph={this.handleUpdateGraph}
                />
              </Col>
            </Row>
          </Content>
        </Layout>
      </div>
    );
  }
}

export default MonitorDashboard;
