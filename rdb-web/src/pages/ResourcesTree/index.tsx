import React, { useLayoutEffect, useContext } from 'react';
import { Tabs } from 'antd';
import { FormattedMessage } from 'react-intl';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import Info from './Info';
import Role from './Role';
import Resources from './Resources'


const { TabPane } = Tabs;
const defaultActiveKey = window.localStorage.getItem('resources-tree-active-key') || 'role';

function index() {
  const nsTreeContext = useContext(NsTreeContext);
  useLayoutEffect(() => {
    nsTreeContext.nsTreeVisibleChange(true, true, true);
    return () => {
      nsTreeContext.nsTreeVisibleChange(false, true, false);
    };
  }, []);

  return (
    <Tabs
      animated={false}
      defaultActiveKey={defaultActiveKey}
      onChange={(key) => {
        window.localStorage.setItem('resources-tree-active-key', key);
      }}
    >
      <TabPane tab={<FormattedMessage id="resourcesTree-tab-info" />} key="info">
        <Info />
      </TabPane>
      <TabPane tab={<FormattedMessage id="resourcesTree-tab-role" />} key="role">
        <Role />
      </TabPane>
      <TabPane tab={<FormattedMessage id="resourcesTree-tab-resource" />} key="resource">
        <Resources />
      </TabPane>
    </Tabs>
  )
}

export default index;
