import React, { Component } from 'react';
import { Icon, Table } from 'antd';
import update from 'immutability-helper';
import queryString from 'query-string';
import _ from 'lodash';
import Graph, { GraphConfig, Info } from '@pkgs/Graph';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import request from '@pkgs/request';
import api from '@common/api';

const apiTooltipHelp = [
  {
    id: 0,
    cn: '正常',
    en: 'OK',
  }, {
    id: 1,
    cn: '异常',
    en: 'ERROR',
  }, {
    id: 2,
    cn: '返回内容校验失败',
    en: 'RETURN_CHECK_ERROR',
  }, {
    id: 3,
    cn: 'URL 格式错误',
    en: 'URL_FORMAT_ERROR',
  }, {
    id: 6,
    cn: 'DNS解析失败',
    en: 'COULDNT_RESOLVE_HOST',
  }, {
    id: 7,
    cn: '连接失败 or 超时',
    en: 'COULDNT_CONNECT',
  }, {
    id: 13,
    cn: '请求处理超时',
    en: 'READ_WRITE_TIMEOUT',
  }, {
    id: 14,
    cn: '超过重定向次数',
    en: 'TOO_MANY_REDIRECTS',
  }, {
    id: 15,
    cn: 'SSL握手失败',
    en: 'PEER_FAILED_VERIFICATION',
  }, {
    id: 16,
    cn: '未定义错误',
    en: 'SYS_UNKNOWN_ERROR',
  },
];

class Tmpchart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
    this.graphs = {};
  }

  componentDidMount = () => {
    this.fetchData(this.props);
  }

  fetchData(props) {
    const search = _.get(props, 'location.search');

    if (search) {
      const query = queryString.parse(search);
      request(`${api.tmpchart}?ids=${query.id}`).then((res) => {
        const data = _.map(res, (item) => {
          let { configs } = item;
          try {
            configs = JSON.parse(configs);
          } catch (e) {
            console.log(e);
          }
          if (!configs.id) {
            configs.id = (new Date()).getTime();
          }
          return configs;
        });
        this.setState({ data });
      });
    }
  }

  resizeGraphs = () => {
    _.each(this.graphs, (graph) => {
      if (graph) {
        graph.resize();
      }
    });
  }

  handleUpdateGraph = (type, id, updateConf, cbk) => {
    const { data } = this.state;
    const index = _.findIndex(data, { id });
    if (type === 'allUpdate') {
      this.setState({
        data: updateConf,
      });
    } else if (type === 'update') {
      const currentConf = _.find(data, { id });
      this.setState(update(this.state, {
        data: {
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
    }
  }

  handleGraphConfigChange = (type, data, id) => {
    if (type === 'update') {
      this.handleUpdateGraph('update', id, {
        ...data,
      });
    }
  }

  render() {
    const { data } = this.state;
    return (
      <div>
        {
          _.map(data, (item) => {
            const { id } = item;
            const metric = _.get(item, 'metrics[0].selectedMetric');
            return (
              <div
                key={id}
                style={{ marginBottom: 10 }}
              >
                <Graph
                  ref={(ref) => { this.graphs[item.id] = ref; }}
                  data={{
                    id,
                    ...item,
                  }}
                  onChange={this.handleUpdateGraph}
                  extraRender={graph => [
                    <span className="graph-operationbar-item" key="info" title="详情">
                      <Info
                        graphConfig={graph.getGraphConfig(graph.props.data)}
                        counterList={graph.state.counterList}
                      >
                        <Icon type="info-circle-o" />
                      </Info>
                    </span>,
                    <span className="graph-operationbar-item" key="setting" title="编辑">
                      <Icon type="setting" onClick={() => {
                        this.graphConfigForm.showModal('update', '保存', item);
                      }} />
                    </span>,
                  ]}
                />
                {
                  // show some help for api metric.
                  metric === 'api_status' || metric === 'api.status'
                    ? <Table
                      style={{ marginTop: 10 }}
                      bordered
                      size="small"
                      dataSource={apiTooltipHelp}
                      columns={[
                        {
                          title: 'Value',
                          dataIndex: 'id',
                        }, {
                          title: 'Status',
                          dataIndex: 'cn',
                          colSpan: 2,
                        }, {
                          dataIndex: 'en',
                          colSpan: 0,
                        },
                      ]}
                    /> : null
                }
              </div>
            );
          })
        }
        <GraphConfig
          ref={(ref) => { this.graphConfigForm = ref; }}
          onChange={this.handleGraphConfigChange}
        />
      </div>
    );
  }
}

export default CreateIncludeNsTree(Tmpchart, { visible: false });
