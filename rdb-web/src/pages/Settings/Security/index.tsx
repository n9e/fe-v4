import React from 'react';
import { Tabs } from 'antd';
import Login from './Login';
import White from './White';


const { TabPane } = Tabs;
const defaultActiveKey = window.localStorage.getItem('resources-tree-active-key') || 'role';

function index() {
  return (
    <Tabs
      animated={false}
      defaultActiveKey={defaultActiveKey}
      onChange={(key) => {
        window.localStorage.setItem('resources-tree-active-key', key);
      }}
    >
      <TabPane tab='登录设置' key="login">
        < Login/>
      </TabPane>
      <TabPane tab='IP白名单' key="white">
        < White/>
      </TabPane>
    </Tabs>
  )
}

export default index;
