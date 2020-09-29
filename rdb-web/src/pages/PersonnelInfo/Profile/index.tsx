import React from 'react';
import { Tabs } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import Profile from '@pkgs/Layout/Self/Profile';
import Password from '@pkgs/Layout/Self/Password';
import Token from '@pkgs/Layout/Self/Token';

const { TabPane } = Tabs;

function Settings(props: WrappedComponentProps) {
  return (
    <Tabs>
      <TabPane tab={props.intl.formatMessage({ id: 'user.settings.profile' })} key="baseSetting">
        <Profile />
      </TabPane>
      <TabPane tab={props.intl.formatMessage({ id: 'user.settings.password' })} key="resetPassword">
        <Password />
      </TabPane>
      <TabPane tab={props.intl.formatMessage({ id: 'user.settings.token' })} key="token">
        <Token />
      </TabPane>
    </Tabs>
  );
}

export default injectIntl(Settings);
