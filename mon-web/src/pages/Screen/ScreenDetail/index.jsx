import React, { Component } from 'react';
import {
  Button, Card, Divider, Popconfirm, message, Row, Col, Select, Checkbox, Dropdown, Menu, Icon, Anchor, Tooltip,
} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import update from 'immutability-helper';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { GraphConfig, config as graphcConfig, util as graphUtil } from '@pkgs/Graph';
import DateInput from '@pkgs/DateInput';
import request from '@pkgs/request';
import api from '@common/api';
import { prefixCls } from '@common/config';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import AddModal from './AddModal';
import ModifyModal from './ModifyModal';
import GraphsContainer from './GraphsContainer';
import BatchMoveSubclass from './BatchMoveSubclass';


const { Option } = Select;
const { Link } = Anchor;

function updateTime(nowMoment, graphConfig) {
  let start;
  let end;
  let now;

  if (graphConfig) {
    const timeDiff = Number(graphConfig.end) - Number(graphConfig.start);
    now = nowMoment.format('x');
    end = nowMoment.format('x');
    start = _.toString(Number(end) - timeDiff);
  }

  return {
    now, start, end,
  };
}

const COUNTDOWN = 9; // 0 ~ 9
const getDefaultColNum = () => {
  let defaultColNum = window.localStorage.getItem('mon-screen-colNum');
  if (defaultColNum) {
    try {
      defaultColNum = JSON.parse(defaultColNum);
    } catch (e) {
      defaultColNum = {};
      console.log('解析监控大盘缓存列数失败');
    }
  } else {
    defaultColNum = {};
  }
  return defaultColNum;
};

class ScreenDetail extends Component {
  static contextType = NsTreeContext;

  constructor(props) {
    super(props);
    const screenId = _.get(props, 'match.params.screenId');
    const defaultColNum = getDefaultColNum();
    this.state = {
      subclassLoading: false,
      subclassData: [],
      chartData: [],
      colNum: _.get(defaultColNum, screenId, 3),
      autoRefresh: false,
      countdown: COUNTDOWN,
    };
    this.firstFetch = true;
    this.graphs = {};
    this.now = moment();
  }

  componentDidMount = () => {
    this.fetchTreeData(() => {
      this.fetchSubclass(this.props);
    });
  }

  fetchTreeData(cbk) {
    request(api.tree).then((res) => {
      this.setState({ originTreeData: res }, () => {
        if (cbk) cbk();
      });
    });
  }

  async fetchSubclass(props) {
    const screenId = _.get(props, 'match.params.screenId');
    if (screenId) {
      this.setState({ subclassLoading: true });

      try {
        const screenDetail = await request(`${api.screen}/${screenId}`);
        const subclassData = await request(`${api.screen}/${screenId}/subclass`);
        this.setState({ subclassData: subclassData || [] });
        let chartData = [];
        await Promise.all(
          _.map(subclassData, async (item) => {
            const chartDataItem = await request(`${api.subclass}/${item.id}/chart`);
            if (chartDataItem) {
              chartData = _.concat(chartData, chartDataItem);
            }
          }),
        );
        _.each(chartData, (item) => {
          try {
            const graphConfig = JSON.parse(item.configs);
            item.configs = {
              ...graphConfig,
              ...updateTime(this.now, graphConfig),
            };
          } catch (e) {
            console.log(e);
          }
        });
        this.setState({
          screenDetail,
          chartData: _.groupBy(chartData, 'subclass_id'),
        }, () => {
          // const { hash } = this.props.location;
          // if (hash && this.firstFetch) {
          //   const anchorEle = document.querySelector(hash);
          //   if (anchorEle) {
          //     anchorEle.scrollIntoView();
          //   }
          // }
          // this.firstFetch = false;
        });
      } catch (e) {
        console.log(e);
      }
      this.setState({ subclassLoading: false });
    }
  }

  resizeGraphs = () => {
    _.each(this.graphs, (graph) => {
      if (graph) {
        graph.resize();
      }
    });
  }

  refreshGraphs = () => {
    const makeCountdown = () => {
      this.timer = setTimeout(() => {
        const { countdown } = this.state;
        if (countdown > 0) {
          this.setState({ countdown: countdown - 1 });
        } else {
          const { chartData } = this.state;
          const chartDataClone = _.cloneDeep(chartData);
          const nowMoment = moment();

          _.each(chartDataClone, (graphs) => {
            _.each(graphs, (item) => {
              const graphConfig = item.configs;
              item.configs = {
                ...item.configs,
                ...updateTime(nowMoment, graphConfig),
              };
            });
          });

          this.setState({ chartData: chartDataClone, countdown: COUNTDOWN });
        }
        makeCountdown();
      }, 1000);
    };
    makeCountdown();
  }

  handleTimeOptionChange = (val) => {
    const nowMoment = moment();
    const { chartData } = this.state;
    const chartDataClone = _.cloneDeep(chartData);
    let start;
    let end;
    const now = nowMoment.format('x');

    if (val !== 'custom') {
      start = nowMoment.clone().subtract(Number(val), 'ms').format('x');
      end = nowMoment.format('x');
    } else {
      start = nowMoment.clone().subtract(2, 'hour').format('x');
      end = moment().format('x');
    }

    _.each(chartDataClone, (graphs) => {
      _.each(graphs, (item) => {
        item.configs = {
          ...item.configs,
          now,
          end,
          start,
        };
      });
    });

    this.setState({
      chartData: chartDataClone, now, start, end,
    });
  }

  handleDateChange = (key, d) => {
    const { chartData } = this.state;
    const chartDataClone = _.cloneDeep(chartData);
    const val = _.isDate(d) ? _.toString(d.getTime()) : null;

    _.each(chartDataClone, (graphs) => {
      _.each(graphs, (item) => {
        item.configs = {
          ...item.configs,
          [key]: val,
        };
      });
    });

    this.setState({ chartData: chartDataClone, [key]: val });
  }

  handleAddSubclass = () => {
    const { subclassData } = this.state;
    const screenId = _.get(this.props, 'match.params.screenId');
    AddModal({
      language: this.props.intl.locale,
      title: this.props.intl.formatMessage({ id: 'table.create' }),
      onOk: (values) => {
        request(`${api.screen}/${screenId}/subclass`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            weight: subclassData.length,
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          this.fetchSubclass(this.props);
        });
      },
    });
  }

  handleBatchMoveSubclass = () => {
    BatchMoveSubclass({
      language: this.props.intl.locale,
      data: this.state.subclassData,
      treeData: _.cloneDeep(this.state.originTreeData),
      onOk: (values) => {
        const reqBody = _.map(values.subclasses, (item) => {
          return {
            id: item,
            screen_id: values.screenId,
          };
        });
        request(`${api.subclass}es/loc`, {
          method: 'PUT',
          body: JSON.stringify(reqBody),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
          this.fetchSubclass(this.props);
        });
      },
    });
  }

  handleModSubclass = (subclassObj) => {
    ModifyModal({
      language: this.props.intl.locale,
      title: this.props.intl.formatMessage({ id: 'table.modify' }),
      name: subclassObj.name,
      onOk: (values) => {
        const { subclassData } = this.state;
        const newSubclassData = _.map(subclassData, (item) => {
          if (item.id === subclassObj.id) {
            return {
              ...item,
              ...values,
            };
          }
          return item;
        });
        request(api.subclass, {
          method: 'PUT',
          body: JSON.stringify(newSubclassData),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
          this.fetchSubclass(this.props);
        });
      },
    });
  }

  handleDelSubclass = (id) => {
    request(`${api.subclass}/${id}`, {
      method: 'DELETE',
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.delete.success' }));
      this.fetchSubclass(this.props);
    });
  }

  handleMoveSubclass = (type, activeWeight) => {
    const { subclassData } = this.state;
    const newSubclassData = _.map(subclassData, (item) => {
      let { weight } = item;

      if (type === 'up') {
        if (item.weight === activeWeight) {
          weight = activeWeight - 1;
        }
        if (item.weight === activeWeight - 1) {
          weight = activeWeight;
        }
      } else if (type === 'down') {
        if (item.weight === activeWeight) {
          weight = activeWeight + 1;
        }
        if (item.weight === activeWeight + 1) {
          weight = activeWeight;
        }
      }
      return {
        ...item,
        weight,
      };
    });
    request(api.subclass, {
      method: 'PUT',
      body: JSON.stringify(newSubclassData),
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.sort.success' }));
      this.setState({ subclassData: _.sortBy(newSubclassData, 'weight') });
    });
  }

  handleAddChart = (configs, currentSubclassId = this.currentSubclassId) => {
    const { chartData } = this.state;
    const chartDataClone = _.cloneDeep(chartData);
    const subclassChartData = chartDataClone[currentSubclassId] || [];
    request(`${api.subclass}/${currentSubclassId}/chart`, {
      method: 'POST',
      body: JSON.stringify({
        configs: JSON.stringify({
          ...configs,
        }),
        weight: subclassChartData.length,
      }),
    }).then((res) => {
      chartDataClone[currentSubclassId] = _.concat(subclassChartData, [{
        configs,
        id: res,
        subclass_id: currentSubclassId,
        weight: subclassChartData.length,
      }]);
      this.setState({ chartData: chartDataClone });
    });
  }

  handleModChart = (subclassId, id, reqData) => {
    request(`${api.chart}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        subclass_id: reqData.subclassId,
        configs: JSON.stringify(reqData.configs),
      }),
    }).then(() => {
      const { chartData } = this.state;
      const chartDataClone = _.cloneDeep(chartData);
      const currentChart = _.find(chartDataClone[subclassId], { id });
      if (currentChart) {
        currentChart.subclass_id = reqData.subclassId;
        currentChart.configs = reqData.configs;
      }
      this.setState({ chartData: chartDataClone });
    });
  }

  handleDelChart = (subclassId, chartId) => {
    const { chartData } = this.state;
    const chartDataClone = _.cloneDeep(chartData);
    const idx = _.findIndex(chartDataClone[subclassId], { id: chartId });
    chartDataClone[subclassId].splice(idx, 1);
    _.each(chartDataClone[subclassId], (item, i) => {
      item.weight = i;
    });
    this.setState({ chartData: chartDataClone });
    request(`${api.chart}/${chartId}`, {
      method: 'DELETE',
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.delete.success' }));
    });
    const reqBody = _.map(chartDataClone[subclassId], (item) => {
      return {
        id: item.id,
        weight: item.weight,
      };
    });
    request(`${api.chart}s/weights`, {
      method: 'PUT',
      body: JSON.stringify(reqBody),
    });
  }

  handleGraphConfigChange = (type, data) => {
    const { subclassId } = data;
    delete data.subclassId;
    _.each(data.metrics, (item) => {
      delete item.key;
      delete item.metrics;
      delete item.tagkv;
      delete item.counterList;
      delete item.endpoints;
    });

    if (type === 'push') {
      this.handleAddChart(data);
    } else if (type === 'update') {
      this.handleModChart(subclassId, data.id, {
        subclassId,
        configs: data,
      });
    }
  }

  renderSubclass = (subclassObj, idx) => {
    const { chartData, subclassData } = this.state;
    const subclassChartData = chartData[subclassObj.id];
    return (
      <Card
        key={subclassObj.id}
        type="inner"
        className="ant-card-compact mb10"
        bodyStyle={{ padding: 10 }}
        title={
          <span>
            {subclassObj.name}
          </span>
        }
        extra={
          <span>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item>
                    <a onClick={() => {
                      if (this.graphConfigForm) {
                        this.currentSubclassId = subclassObj.id;
                        this.graphConfigForm.showModal('push', this.props.intl.formatMessage({ id: 'table.create' }), {
                          metrics: [{
                            selectedNid: _.get(this.context, 'data.selectedNode.id'),
                          }],
                        });
                      }
                    }}>
                      <FormattedMessage id="screen.tag.graph.add.graph" />
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => {
                      if (this.graphConfigForm) {
                        this.currentSubclassId = subclassObj.id;
                        this.graphConfigForm.showModal('push', this.props.intl.formatMessage({ id: 'table.create' }), {
                          metrics: [{
                            selectedNid: _.get(this.context, 'data.selectedNode.id'),
                          }],
                          chartTypeOptions: {
                            chartType: 'singleValue',
                            targetValue: 'avg', // current, avg, max, min
                            subType: 'normal', // normal, solidGauge, liquidFillGauge
                            valueMap: 'range', // range, value
                            mapConf: [{}],
                          },
                        });
                      }
                    }}>
                      <FormattedMessage id="screen.tag.graph.add.number" />
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => {
                      if (this.graphConfigForm) {
                        this.currentSubclassId = subclassObj.id;
                        this.graphConfigForm.showModal('push', this.props.intl.formatMessage({ id: 'table.create' }), {
                          metrics: [{
                            selectedNid: _.get(this.context, 'data.selectedNode.id'),
                          }],
                          chartTypeOptions: {
                            chartType: 'table',
                            tableType: 'stats',
                            columnsKey: ['avg', 'last'],
                            valueMap: 'range', // range, value
                            mapConf: [{}],
                          },
                        });
                      }
                    }}>
                      <FormattedMessage id="screen.tag.graph.add.table" />
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => {
                      if (this.graphConfigForm) {
                        this.currentSubclassId = subclassObj.id;
                        this.graphConfigForm.showModal('push', this.props.intl.formatMessage({ id: 'table.create' }), {
                          metrics: [{
                            selectedNid: _.get(this.context, 'data.selectedNode.id'),
                          }],
                          chartTypeOptions: {
                            chartType: 'pie',
                            pieType: 'pie',
                            targetValue: 'avg',
                          },
                        });
                      }
                    }}>
                      <FormattedMessage id="screen.tag.graph.add.pie" />
                    </a>
                  </Menu.Item>
                </Menu>
              }
            >
              <a className="ant-dropdown-link">
                <FormattedMessage id="screen.tag.graph.add" />
                {' '}
                <Icon type="down" />
              </a>
            </Dropdown>
            <Divider type="vertical" />
            <a onClick={() => this.handleModSubclass(subclassObj)}><FormattedMessage id="table.modify" /></a>
            <Divider type="vertical" />
            <Popconfirm title={<FormattedMessage id="table.delete.sure" />} onConfirm={() => this.handleDelSubclass(subclassObj.id)}>
              <a><FormattedMessage id="table.delete" /></a>
            </Popconfirm>
            <Divider type="vertical" />
            <a
              disabled={idx === 0}
              onClick={() => this.handleMoveSubclass('up', subclassObj.weight)}
            >
              <FormattedMessage id="screen.tag.up" />
            </a>
            <Divider type="vertical" />
            <a
              disabled={idx === subclassData.length - 1}
              onClick={() => this.handleMoveSubclass('down', subclassObj.weight)}
            >
              <FormattedMessage id="screen.tag.down" />
            </a>
          </span>
        }
      >
        <GraphsContainer
          subclassId={subclassObj.id}
          axis="xy"
          useDragHandle
          data={subclassChartData}
          colNum={this.state.colNum}
          graphsInstance={this.graphs}
          graphConfigForm={this.graphConfigForm}
          subclassData={this.state.subclassData}
          originTreeData={this.state.originTreeData}
          onCloneGraph={(configs) => {
            this.currentSubclassId = subclassObj.id;
            this.graphConfigForm.showModal('push', this.props.intl.formatMessage({ id: 'table.create' }), {
              ...configs,
            });
          }}
          onDelChart={id => this.handleDelChart(subclassObj.id, id)}
          onSortEnd={({ oldIndex, newIndex }) => {
            const newSubclassChartData = _.sortBy(_.map(subclassChartData, (item, i) => {
              let { weight } = item;
              if (i === oldIndex) {
                // eslint-disable-next-line prefer-destructuring
                weight = subclassChartData[newIndex].weight;
              }
              if (oldIndex < newIndex) {
                if (i > oldIndex && i <= newIndex) {
                  weight = item.weight - 1;
                }
              }
              if (oldIndex > newIndex) {
                if (i >= newIndex && i < oldIndex) {
                  weight = item.weight + 1;
                }
              }
              return {
                ...item,
                weight,
              };
            }), 'weight');
            this.setState(update(this.state, {
              chartData: {
                [subclassObj.id]: {
                  $set: newSubclassChartData,
                },
              },
            }));
            const reqBody = _.map(newSubclassChartData, (item) => {
              return {
                id: item.id,
                weight: item.weight,
              };
            });
            request(`${api.chart}s/weights`, {
              method: 'PUT',
              body: JSON.stringify(reqBody),
            }).then(() => {
              message.success(this.props.intl.formatMessage({ id: 'msg.sort.success' }));
            });
          }}
        />
      </Card>
    );
  }

  handlerCallBack = () => {
    const { history } = this.props;
    history.push({ pathname: '/screen' });
  }

  render() {
    const screenId = _.get(this.props, 'match.params.screenId');
    const {
      subclassData, now, start, end,
    } = this.state;
    let timeVal;
    if (start && end) {
      timeVal = now === end ? graphUtil.getTimeLabelVal(start, end, 'value') : 'custom';
    }
    const datePickerStartVal = moment(Number(start)).format(graphcConfig.timeFormatMap.moment);
    const datePickerEndVal = moment(Number(end)).format(graphcConfig.timeFormatMap.moment);

    return (
      <>
        <Row className="mb10">
          <Col span={10}>
            <Button onClick={this.handlerCallBack} style={{ marginRight: 8 }}>返回列表</Button>
            <Button onClick={this.handleAddSubclass} style={{ marginRight: 8 }}><FormattedMessage id="screen.tag.add" /></Button>
            <Button onClick={this.handleBatchMoveSubclass}><FormattedMessage id="screen.tag.batch.modify" /></Button>
            <Tooltip title={_.get(this.state.screenDetail, 'node_path')}>
              <svg
                style={{ position: 'relative', top: 3, left: 8 }}
                width="16px"
                height="16px"
                viewBox="0 0 16 16"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="none">
                  <g fill="#595959">
                    <g>
                      <path d="M3,6 L3,7.557 L4.00004919,7.55797745 L4.00004919,8.55797745 L3,8.557 L3,13.5 L4.08605259,13.5 L4.08605259,14.5 L3,14.5 L3,16 L2,16 L2,6 L3,6 Z M7,12 C8.1045695,12 9,12.8954305 9,14 C9,15.1045695 8.1045695,16 7,16 C5.8954305,16 5,15.1045695 5,14 C5,12.8954305 5.8954305,12 7,12 Z M16,13 L16,15 L10,15 L10,13 L16,13 Z M7,6 C8.1045695,6 9,6.8954305 9,8 C9,9.1045695 8.1045695,10 7,10 C5.8954305,10 5,9.1045695 5,8 C5,6.8954305 5.8954305,6 7,6 Z M16,7 L16,9 L10,9 L10,7 L16,7 Z M2.5,4.4408921e-16 C3.88071187,4.4408921e-16 5,1.11928813 5,2.5 C5,3.88071187 3.88071187,5 2.5,5 C1.11928813,5 0,3.88071187 0,2.5 C0,1.11928813 1.11928813,4.4408921e-16 2.5,4.4408921e-16 Z M16,1 L16,3 L6,3 L6,1 L16,1 Z" />
                    </g>
                  </g>
                </g>
              </svg>
            </Tooltip>
          </Col>
          <Col span={14} className="textAlignRight">
            <span style={{ paddingRight: 10 }}>
              <FormattedMessage id="graph.config.time" />
              ：
              <Select size="default" style={
                timeVal === 'custom'
                  ? {
                    width: 80,
                    marginRight: 10,
                  } : {
                    width: 80,
                  }
              }
                placeholder="无"
                value={timeVal}
                onChange={this.handleTimeOptionChange}
              >
                {
                  _.map(graphcConfig.time, o => <Option key={o.value} value={o.value}><FormattedMessage id={o.label} /></Option>)
                }
              </Select>
              {
                timeVal === 'custom'
                  ? [
                    <DateInput key="datePickerStart"
                      format={graphcConfig.timeFormatMap.antd}
                      style={{
                        position: 'relative',
                        width: 120,
                      }}
                      value={datePickerStartVal}
                      onChange={d => this.handleDateChange('start', d)}
                    />,
                    <span key="datePickerDivider" style={{ paddingLeft: 10, paddingRight: 10 }}>-</span>,
                    <DateInput key="datePickerEnd"
                      format={graphcConfig.timeFormatMap.antd}
                      style={{
                        position: 'relative',
                        width: 120,
                      }}
                      value={datePickerEndVal}
                      onChange={d => this.handleDateChange('end', d)}
                    />,
                  ] : false
              }
            </span>
            <Checkbox
              style={{ marginRight: 8 }}
              checked={this.state.autoRefresh}
              onChange={(e) => {
                this.setState({
                  autoRefresh: e.target.checked,
                }, () => {
                  if (e.target.checked) {
                    this.refreshGraphs();
                  } else if (!e.target.checked && this.timer) {
                    this.setState({ countdown: COUNTDOWN });
                    clearTimeout(this.timer);
                  }
                });
              }}
            >
              <FormattedMessage id="screen.auto.refresh" />
              {' '}
              {this.state.autoRefresh ? `(${this.state.countdown})` : ''}
            </Checkbox>
            <Select
              style={{ width: 75 }}
              value={this.state.colNum}
              onChange={(value) => {
                window.localStorage.setItem('mon-screen-colNum', JSON.stringify({
                  ...getDefaultColNum(),
                  [screenId]: value,
                }));
                this.setState({ colNum: value }, () => {
                  this.resizeGraphs();
                });
              }}
            >
              <Option key="1" value={1}>
                1
                <FormattedMessage id="screen.col" />
              </Option>
              <Option key="2" value={2}>
                2
                <FormattedMessage id="screen.col" />
              </Option>
              <Option key="3" value={3}>
                3
                <FormattedMessage id="screen.col" />
              </Option>
              <Option key="4" value={4}>
                4
                <FormattedMessage id="screen.col" />
              </Option>
            </Select>
          </Col>
        </Row>
        <div>
          {
            _.map(subclassData, (item, idx) => {
              return (
                <div id={item.name} key={item.name}>
                  {this.renderSubclass(item, idx)}
                </div>
              );
            })
          }
        </div>
        <GraphConfig
          ref={(ref) => { this.graphConfigForm = ref; }}
          onChange={this.handleGraphConfigChange}
        />
        <div className={`${prefixCls}-monitor-screen-detail-anchor`}>
          <Anchor>
            {
              _.map(subclassData, (item) => {
                return <Link key={item.name} href={`#${item.name}`} title={item.name} />;
              })
            }
          </Anchor>
        </div>
      </>
    );
  }
}

export default CreateIncludeNsTree(injectIntl(ScreenDetail));
