import React, { Component } from 'react';
import { Tabs } from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import List from './List';

const { TabPane } = Tabs;

class index extends Component {
  static contextType = NsTreeContext;

  state = {
    activeKey: 'alert',
  };

  render() {
    const { selectedNode } = this.context.data;
    const nodepath = _.get(selectedNode, 'path');
    const nid = _.get(selectedNode, 'id');

    return (
      <Tabs
        activeKey={this.state.activeKey}
        onChange={(activeKey) => {
          this.setState({ activeKey });
        }}
      >
        <TabPane tab={<FormattedMessage id="event.tab.alert" />} key="alert">
          <List
            nodepath={nodepath}
            nid={nid}
            type="alert"
            activeKey={this.state.activeKey}
          />
        </TabPane>
        <TabPane tab={<FormattedMessage id="event.tab.all" />} key="all">
          <List
            nodepath={nodepath}
            nid={nid}
            type="all"
            activeKey={this.state.activeKey}
          />
        </TabPane>
      </Tabs>
    );
  }
}

export default CreateIncludeNsTree(index, { visible: true });
