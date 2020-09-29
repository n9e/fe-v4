import React, { Component } from 'react';
import { Switch, Popover, Input, Button, Card, Spin } from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import Multipicker from '@pkgs/Multipicker';
import { util as graphUtil } from '@pkgs/Graph';
import { prefixCls } from './config';

export default class HostSelect extends Component<any, any> {
  // static propTypes = {
  //   loading: PropTypes.bool.isRequired,
  //   hosts: PropTypes.array,
  //   selectedHosts: PropTypes.array,
  //   // eslint-disable-next-line react/forbid-prop-types
  //   graphConfigs: PropTypes.array,
  //   updateGraph: PropTypes.func,
  //   // eslint-disable-next-line react/forbid-prop-types
  //   onSelectedHostsChange: PropTypes.func,
  // };

  static defaultProps = {
    hosts: [],
    selectedHosts: [],
    graphConfigs: [],
    updateGraph: () => {},
    onSelectedHostsChange: () => {},
  };

  constructor(props: any) {
    super(props);
    this.state = {
      dynamicSwitch: false,
    };
  }

  handleSelectChange = (selected: string[]) => {
    if (graphUtil.hasDtag(selected)) {
      selected.splice(0, 1);
    }
    this.props.onSelectedHostsChange(this.props.hosts, selected);
    this.setState({ reloadBtnVisible: true });
  }

  handleDynamicSelect = (type: string, val?: string) => {
    const { graphConfigs } = this.props;
    let selected: string[] | undefined;
    if (type === '=all') {
      selected = ['=all'];
    } else if (type === '=+') {
      selected = [`=+${val}`];
    } else if (type === '=-') {
      selected = [`=-${val}`];
    }
    this.props.onSelectedHostsChange(this.props.hosts, selected);
    if (graphConfigs.length && selected && selected.length) {
      this.setState({ reloadBtnVisible: true });
    }
  }

  handleDynamicSwitchChange = (val: boolean) => {
    this.setState({ dynamicSwitch: val });
  }

  handleReloadBtnClick = () => {
    this.setState({
      reloadBtnVisible: false,
    });
    const { graphConfigs, updateGraph, selectedHosts } = this.props;
    const graphConfigsClone = _.cloneDeep(graphConfigs);
    _.each(graphConfigsClone, (item) => {
      _.each(item.metrics, (metricObj) => {
        const { selectedTagkv } = metricObj;
        const newSelectedTagkv = _.map(selectedTagkv, (tagItem) => {
          if (tagItem.tagk === 'endpoint') {
            return {
              tagk: tagItem.tagk,
              tagv: selectedHosts,
            };
          }
          return tagItem;
        });
        // eslint-disable-next-line no-param-reassign
        metricObj.selectedEndpoint = selectedHosts;
        metricObj.selectedTagkv = newSelectedTagkv;
      });
    });
    updateGraph(graphConfigsClone);
  }

  render() {
    const { selectedHosts, hosts, loading, endpointsKey, onEndpointsKey } = this.props;
    const { dynamicSwitch, reloadBtnVisible } = this.state;
    return (
      <Spin spinning={loading}>
        <Card
          className={`${prefixCls}-card`}
          title={
            <span>
              <a
                className={endpointsKey === 'endpoints' ? 'active' : 'normal'}
                onClick={() => {
                  onEndpointsKey('endpoints');
                }}
              >
                <FormattedMessage id="host.related" />
              </a>
              <a
                className={endpointsKey === 'nids' ? 'active' : 'normal'}
                onClick={() => {
                  onEndpointsKey('nids');
                }}
              >
                <FormattedMessage id="host.unRelated" />
              </a>
            </span>
          }
          bodyStyle={{
            opacity: endpointsKey === 'nids' ? 0.1 : 1
          }}
        >
          <Multipicker
            width="100%"
            manualEntry
            data={hosts}
            type="host"
            selected={selectedHosts}
            onChange={this.handleSelectChange}
          />
          <div style={{ position: 'absolute', top: 12, right: 18 }}>
            {
              dynamicSwitch ?
                <span>
                  <a onClick={() => { this.handleDynamicSelect('=all'); }}><FormattedMessage id="select.all" /></a>
                  <span className="ant-divider" />
                  <Popover
                    trigger="click"
                    content={
                      <div style={{ width: 200 }}>
                        <Input
                          placeholder="Press enter to submit"
                          onKeyDown={(e: any) => {
                            if (e.keyCode === 13) {
                              this.handleDynamicSelect('=+', e.target.value);
                            }
                          }}
                        />
                      </div>
                    }
                  >
                    <a><FormattedMessage id="select.include" /></a>
                  </Popover>
                  <span className="ant-divider" />
                  <Popover
                    trigger="click"
                    content={
                      <div style={{ width: 200 }}>
                        <Input
                          placeholder="Press enter to submit"
                          onKeyDown={(e: any) => {
                            if (e.keyCode === 13) {
                              this.handleDynamicSelect('=-', e.target.value);
                            }
                          }}
                        />
                      </div>
                    }
                  >
                    <a><FormattedMessage id="select.exclude" /></a>
                  </Popover>
                </span> :
                <div>
                  <FormattedMessage id="select.dynamic" /> <Switch onChange={this.handleDynamicSwitchChange} size="small" />
                </div>
            }
          </div>
          {
            reloadBtnVisible ?
              <div style={{ position: 'absolute', bottom: 15, right: 5 }}>
                <Button type="primary" onClick={this.handleReloadBtnClick}>{<FormattedMessage id="graph.machine.list.update" />}</Button>
              </div> : null
          }
          {
            endpointsKey === 'nids' ?
            <div
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1,
              }}
            /> : null
          }
        </Card>
      </Spin>
    );
  }
}
