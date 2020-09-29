import React, { Component } from 'react';
import update from 'react-addons-update';
import { Layout, Row, Col, Button } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import { FormattedMessage } from 'react-intl';
import { config as graphConfig, GlobalOperationbar, services } from '@pkgs/Graph';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import request from '@pkgs/request';
import api from '@common/api';
import MetricSelect from './MetricSelect';
import Graphs from './Graphs';
import { prefixCls, baseMetrics } from './config';
import HostSelect from './HostSelect';
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
      habitsId: undefined,
      selectedHosts: [],
      globalOptions: {
        now: now.clone().format('x'),
        start: now.clone().subtract(3600000, 'ms').format('x'),
        end: now.clone().format('x'),
        comparison: [],
      },
      endpointsKey: 'endpoints', // endpoints | nids
    };
  }

  componentWillReceiveProps = async (nextProps: any, nextContext: any) => {
    const { getSelectedNode, nsTreeVisibleChange } = this.context;
    const nextQuery = queryString.parse(_.get(nextProps, 'location.search'));

    if (nextQuery.mode === 'allHosts') {
      const selectedHosts = nextQuery.selectedHosts ? _.split(nextQuery.selectedHosts, ',') : [];
      if (!this.allHostsMode) {
        this.allHostsMode = true;
        nsTreeVisibleChange(false);
        const hosts = await this.fetchHosts();
        const metrics = await this.fetchMetrics(selectedHosts);
        this.setState({
          selectedHosts,
          selectedTreeNode: undefined,
          hosts,
          metrics,
        }, () => {
          if (!this.onceLoad) {
            this.processBaseMetrics();
            this.onceLoad = true;
          }
        });
      }
    } else {
      const selectedTreeNode = getSelectedNode();
      const nextSelectedTreeNode = nextContext.getSelectedNode();
      if (this.allHostsMode) {
        nsTreeVisibleChange(true);
        this.allHostsMode = false;
      }
      if (!_.isEqual(selectedTreeNode, nextSelectedTreeNode)) {
        const hosts = await this.fetchHosts(_.get(nextSelectedTreeNode, 'id'));
        this.setState({ hosts, selectedHosts: _.map(hosts, 'ident') });
        const metrics = await this.fetchMetrics(_.map(hosts, 'ident'), [], [_.toString(_.get(nextSelectedTreeNode, 'id'))]);
        this.setState({ metrics });
      }
    }
  }

  componentDidMount = async () => {
    const { getSelectedNode } = this.context;
    const query = queryString.parse(_.get(this.props, 'location.search'));
    const selectedTreeNode = getSelectedNode();
    if (query.mode !== 'allHosts' && _.get(selectedTreeNode, 'id')) {
      const hosts = await this.fetchHosts(_.get(selectedTreeNode, 'id'));
      this.setState({ hosts, selectedHosts: _.map(hosts, 'ident') });
      const metrics = await this.fetchMetrics(_.map(hosts, 'ident'), [], [_.toString(_.get(selectedTreeNode, 'id'))]);
      this.setState({ metrics });
    }
  }

  async fetchHosts(nid?: number) {
    let hosts = [];
    try {
      this.setState({ hostsLoading: true });
      if (nid === undefined) {
        const res = await request(`${api.hosts}?limit=5000`);
        hosts = res.list;
      } else {
        hosts = await services.fetchEndPoints(nid);
      }
      this.setState({ hostsLoading: false });
    } catch (e) {
      console.log(e);
    }
    return hosts;
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
      hostsLoading,
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
              <Col span={12}>
                <HostSelect
                  graphConfigs={graphs}
                  loading={hostsLoading}
                  hosts={hosts}
                  habitsId={habitsId}
                  selectedHosts={selectedHosts}
                  onSelectedHostsChange={async (newHosts: string[], newSelectedHosts: string[]) => {
                    const newMetrics = await this.fetchMetrics(newSelectedHosts, _.map(hosts, habitsId));
                    this.setState({ hosts: newHosts, selectedHosts: newSelectedHosts, metrics: newMetrics });
                  }}
                  updateGraph={(newGraphs: any[]) => {
                    this.setState({ graphs: newGraphs });
                  }}
                  endpointsKey={this.state.endpointsKey}
                  onEndpointsKey={(val: string) => {
                    this.setState({ endpointsKey: val }, async () => {
                      const metrics = await this.fetchMetrics(_.map(hosts, habitsId), [], [_.toString(selectedTreeNode)]);
                      this.setState({ metrics });
                    });
                  }}
                />
              </Col>
              <Col span={12}>
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
            </Row>
            <Row style={{ padding: '10px 0' }}>
              <Col span={8}>
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
              </Col>
              <Col span={16} style={{ textAlign: 'right' }}>
                <Button
                  onClick={this.handleSubscribeGraphs}
                  disabled={!graphs.length}
                  style={{ background: '#fff', marginRight: 8 }}
                >
                  <FormattedMessage id="graph.subscribe" />
                </Button>
                <Button
                  onClick={this.handleShareGraphs}
                  disabled={!graphs.length}
                  style={{ background: '#fff', marginRight: 8 }}
                >
                  <FormattedMessage id="graph.share" />
                </Button>
                <Button
                  onClick={this.handleRemoveGraphs}
                  disabled={!graphs.length}
                  style={{ background: '#fff' }}
                >
                  <FormattedMessage id="graph.clear" />
                </Button>
              </Col>
            </Row>
            <Graphs
              value={graphs}
              onChange={this.handleUpdateGraph}
              onGraphConfigSubmit={this.handleGraphConfigSubmit}
              onUpdateGraph={this.handleUpdateGraph}
            />
          </Content>
        </Layout>
      </div>
    );
  }
}

export default CreateIncludeNsTree(MonitorDashboard, { visible: true });
