import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import intlZhCN from './locales/zh';
import intlEnUS from './locales/en';
import { InjectIntlContext } from '@pkgs/hooks/useFormatMessage';
import { Page403, Page404 } from '@pkgs/Exception';
import { Login, Register } from '@pkgs/Auth';
import LayoutMain from '@pkgs/Layout/Main';
import { systemName } from '@common/config';
import HostsManagement from './pages/Hosts/Management';
import HostsManagementDetail from './pages/Hosts/Management/Detail';
import HostsSearch from './pages/Hosts/Search';
import Nethws from './pages/Nethws';

interface LocaleMap {
  [index: string]: any,
}

const localeMap: LocaleMap = {
  zh: {
    antd: antdZhCN,
    intl: 'zh',
    intlMessages: intlZhCN,
  },
  en: {
    antd: antdEnUS,
    intl: 'en',
    intlMessages: intlEnUS,
  },
};

export const { Provider, Consumer } = React.createContext('zh');

const defaultLanguage =  window.localStorage.getItem('language') || navigator.language.substr(0, 2);

const App = () => {
  const [menus, setMenus] = useState<any>([]);
  const [language, setLanguage] = useState(defaultLanguage);
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);
  const title = language === 'zh' ? '资产管理系统' : 'AMS';

  useEffect(() => {
    fetch('/static/amsMenusConfig.json').then((res) => {
      return res.json();
    }).then((res) => {
      setMenus(res);
    });

    window.postMessage({
      type: 'tenantProjectVisible',
      value: false,
    }, window.origin);

    return () => {
      window.postMessage({
        type: 'tenantProjectVisible',
        value: true,
      }, window.origin);
    }
  }, []);

  return (
    <IntlProvider
      locale={_.get(localeMap[language], 'intl', 'zh')}
      messages={intlMessages}
    >
      <ConfigProvider locale={_.get(localeMap[language], 'antd', antdZhCN)}>
        <InjectIntlContext>
          <Provider value={language}>
            <BrowserRouter basename={systemName}>
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route exact path="/403" component={Page403} />
                <Route exact path="/404" component={Page404} />
                <LayoutMain
                  noBackground
                  treeVisible
                  systemName={systemName}
                  systemNameChn={title}
                  menus={menus}
                >
                  <Switch>
                    <Route exact path="/" render={() => <Redirect to="/hosts/management" />} />
                    <Route exact path="/hosts/management" component={HostsManagement} />
                    <Route exact path="/hosts/management/:id" component={HostsManagementDetail} />
                    <Route exact path="/hosts/search" component={HostsSearch} />
                    <Route path="/nethws" component={Nethws as any} />
                  </Switch>
                </LayoutMain>
                <Route render={() => <Redirect to="/404" />} />
              </Switch>
            </BrowserRouter>
          </Provider>
        </InjectIntlContext>
      </ConfigProvider>
    </IntlProvider>
  );
}

export default App;
