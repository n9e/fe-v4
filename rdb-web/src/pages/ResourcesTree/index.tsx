import React, { useLayoutEffect, useContext, useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { FormattedMessage } from 'react-intl';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import Info from './Info';
import Role from './Role';
import Resources from './Resources'
import Usages from './Usages';


const { TabPane } = Tabs;
const defaultActiveKey = window.localStorage.getItem('resources-tree-active-key') || 'role';

function index() {
  const [feConf, setFeConf] = useState({} as any);
  const [isPublic, setIsPublic] = useState(false);
  const nsTreeContext = useContext(NsTreeContext);
  useLayoutEffect(() => {
    nsTreeContext.nsTreeVisibleChange(true, true, true);
    return () => {
      nsTreeContext.nsTreeVisibleChange(false, true, false);
    };
  }, []);

  useEffect(() => {
    fetch('/static/feConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setFeConf(res);
      });
  }, [])

  useEffect(() => {
    if (feConf.header?.mode === 'complicated') {
      setIsPublic(true);
    } else {
      setIsPublic(false);
    }
  }, [feConf]);
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
      {
        isPublic ? <TabPane tab="配额管理" key="usages">
          <Usages />
        </TabPane> : ''
      }
    </Tabs>
  )
}

export default index;
