import React, { Component } from 'react';
import { Popconfirm, Menu, Col } from 'antd';
import { SortableElement } from 'react-sortable-hoc';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import Graph from '@pkgs/Graph';
import request from '@pkgs/request';
import api from '@common/api';
import { normalizeGraphData } from '../../Dashboard/utils';

class RenderGraph extends Component {
  shouldComponentUpdate = (nextProps) => {
    return !_.isEqual(nextProps.data, this.props.data)
    || !_.isEqual(nextProps.subclassData, this.props.subclassData)
    || nextProps.index !== this.props.index
    || nextProps.colNum !== this.props.colNum;
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

  handleCloneGraph = (configs) => {
    this.props.onCloneGraph(configs);
  }

  renderChart() {
    const { data, originTreeData, subclassData } = this.props;
    return (
      <Graph
        useDragHandle
        ref={(ref) => { this.props.graphsInstance[data.id] = ref; }}
        height={200}
        graphConfigInnerVisible={false}
        treeData={originTreeData}
        data={{
          ...data.configs,
          id: data.id,
          shared: true,
        }}
        onChange={(action, id, updateConf) => {
          if (action === 'update' && _.get(updateConf, 'sortOrder')) {
            request(`${api.chart}/${data.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                subclass_id: data.subclass_id,
                configs: JSON.stringify({
                  ...data.configs,
                  ...updateConf,
                }),
              }),
            });
          }
        }}
        onOpenGraphConfig={(graphOptions) => {
          this.props.graphConfigForm.showModal('update', '保存', {
            ...graphOptions,
            subclassId: data.subclass_id,
            isScreen: true,
            subclassOptions: subclassData,
          });
        }}
        extraMoreList={[
          <Menu.Item key="share">
            <a onClick={() => { this.handleShareGraph(data.configs); }}><FormattedMessage id="screen.graph.extraMoreList.share" /></a>
          </Menu.Item>,
          <Menu.Item key="clone">
            <a onClick={() => { this.handleCloneGraph(data.configs); }}><FormattedMessage id="screen.graph.extraMoreList.clone" /></a>
          </Menu.Item>,
          <Menu.Item key="del">
            <Popconfirm title={<FormattedMessage id="screen.graph.extraMoreList.delete.sure" />} onConfirm={() => { this.props.onDelChart(data.id); }}>
              <a><FormattedMessage id="screen.graph.extraMoreList.delete" /></a>
            </Popconfirm>
          </Menu.Item>,
        ]}
      />
    );
  }

  render() {
    const { colNum } = this.props;

    return (
      <Col span={24 / colNum} style={{ marginBottom: 10 }}>
        {this.renderChart()}
      </Col>
    );
  }
}

export default SortableElement(RenderGraph);
