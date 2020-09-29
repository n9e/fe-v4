import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Icon, Dropdown, Menu } from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import Graph, { GraphConfig, Info } from '@pkgs/Graph';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { prefixCls } from './config';
import SubscribeModal from './SubscribeModal';
import { normalizeGraphData } from './utils';

Graph.setOptions({
  apiPrefix: '',
  treeApiPrefix: 'router/tree',
});

export default class Graphs extends Component {
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func,
    onGraphConfigSubmit: PropTypes.func,
    onUpdateGraph: PropTypes.func,
  };

  static defaultProps = {
    value: [],
    onChange: () => {},
    onGraphConfigSubmit: () => {},
    onUpdateGraph: () => {},
  };

  handleSubscribeGraph = (graphData) => {
    const data = normalizeGraphData(graphData);
    const configs = JSON.stringify(data);
    SubscribeModal({
      configsList: [configs],
    });
  }

  handleShareGraph = (graphData) => {
    const data = normalizeGraphData(graphData);
    const configsList = [{
      configs: JSON.stringify(data),
    }];
    request(api.tmpchart, {
      method: 'POST',
      body: JSON.stringify(configsList),
    }).then((res) => {
      window.open(`/mon/tmpchart?id=${_.join(res, ',')}`, '_blank');
    });
  }

  render() {
    const { value, onChange } = this.props;
    return (
      <div>
        <Row gutter={10} className={`${prefixCls}-graphs`}>
          {
            _.map(value, (o) => {
              return (
                <Col span={24} key={o.id}>
                  <div className={`${prefixCls}-graph`}>
                    <Graph
                      data={o}
                      onChange={onChange}
                      extraRender={(graph) => {
                        return [
                          <span className="graph-operationbar-item" key="info">
                            <Info
                              graphConfig={graph.getGraphConfig(graph.props.data)}
                              counterList={graph.counterList}
                            >
                              <Icon type="info-circle-o" />
                            </Info>
                          </span>,
                          <span className="graph-operationbar-item" key="setting">
                            <Icon type="setting" onClick={() => {
                              this.graphConfigForm.showModal('update', <FormattedMessage id="graph.save" />, o);
                            }} />
                          </span>,
                          <span className="graph-operationbar-item" key="close">
                            <Icon type="close-circle-o" onClick={() => {
                              this.props.onUpdateGraph('delete', o.id);
                            }} />
                          </span>,
                          <span className="graph-extra-item" key="more">
                            <Dropdown trigger={['click']} overlay={
                              <Menu>
                                <Menu.Item>
                                  <a onClick={() => { this.handleSubscribeGraph(o); }}><FormattedMessage id="graph.subscribe" /></a>
                                </Menu.Item>
                                <Menu.Item>
                                  <a onClick={() => { this.handleShareGraph(o); }}><FormattedMessage id="graph.share" /></a>
                                </Menu.Item>
                              </Menu>
                            }>
                              <span>
                                <Icon type="bars" />
                              </span>
                            </Dropdown>
                          </span>,
                        ];
                      }}
                    />
                  </div>
                </Col>
              );
            })
          }
        </Row>
        <GraphConfig
          ref={(ref) => { this.graphConfigForm = ref; }}
          onChange={this.props.onGraphConfigSubmit}
        />
      </div>
    );
  }
}
