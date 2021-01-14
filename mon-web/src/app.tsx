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
import { PrivateRoute } from '@pkgs/Auth';
import LayoutMain from '@pkgs/Layout/Main';
import { appname } from './common/config';
import Dashboard from './pages/Dashboard';
import Tmpchart from './pages/Tmpchart';
import Screen from './pages/Screen';
import BigScreen from './pages/BigScreen';
import BigScreenDetail from './pages/BigScreen/Detail';
import ScreenDetail from './pages/Screen/ScreenDetail/';
import SRM from './pages/SRM';
import Strategy from './pages/Strategy';
import StrategyAdd from './pages/Strategy/Add';
import StrategyModify from './pages/Strategy/Modify';
import StrategyClone from './pages/Strategy/Clone';
import Silence from './pages/Silence';
import SilenceAdd from './pages/Silence/Add';
import HistoryCur from './pages/History/Current';
import HistoryAll from './pages/History/All';
import HistoryDetail from './pages/History/Detail';
import Collect from './pages/Collect';
import CollectRule from './pages/CollectRule';
import SbugroupForm from './pages/CollectRule/SbugroupForm';
import CollectFormMain from './pages/Collect/CollectFormMain';
import SNMP from './pages/SNMP';
import SNMPFormMain from './pages/SNMP/FormMain';
import API from './pages/API';
import APIFormMain from './pages/API/FormMain';
import Charts from './pages/Charts';
import AggrStra from './pages/AggrStra';
import NginxLog from './pages/NginxLog';
import NginxLogAdd from './pages/NginxLog/NginxAdd';
import Binlog from './pages/Binlog';
import BinlogAdd from './pages/Binlog/BinlogAdd';

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
const defaultLanguage = window.localStorage.getItem('language') || navigator.language.substr(0, 2);

function App() {
  const [menus, setMenus] = useState<any>([]);
  const [language, setLanguage] = useState(defaultLanguage);
  const [mainNoBackground, setMainNoBackground] = useState(false);
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);
  const title = language === 'zh' ? '监控告警系统' : 'MON';

  // const getMonMenus = async () => {
  //   return await request(`${api.collectRules}?category=remote`).then((res) => 
  //      res.map((items: any) => ({
  //       name: items,
  //       path: items,
  //       isIntl: false,
  //     })));
  // };

  const getMonMenusLocal = async () => {
    return fetch("/static/monMenusConfig.json")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res
      });
  };

  useEffect(() => {
    Promise.all([getMonMenusLocal()]).then(([menusLocal]) => {
      setMenus(menusLocal)
    })
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'language') {
        setLanguage(data.value);
      }
    }, false);
    window.postMessage({
      type: 'tenantProjectVisible',
      value: false,
    }, window.location.origin);

    return () => {
      window.postMessage({
        type: 'tenantProjectVisible',
        value: true,
      }, window.location.origin);
    }
  }, []);

  return (
    <IntlProvider
      locale={_.get(localeMap[language], 'intl', 'zh')}
      messages={intlMessages}
    >
      <InjectIntlContext>
        <ConfigProvider locale={_.get(localeMap[language], 'antd', antdZhCN)}>
          <Provider value={language}>
            <BrowserRouter basename={appname}>
              <Switch>
                <Route exact path="/charts" component={Charts} />
                <LayoutMain
                  systemName={appname}
                  systemNameChn={title}
                  treeVisible
                  menus={menus}
                  noBackground={mainNoBackground}
                >
                  <Switch>
                      <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
                      <PrivateRoute exact path="/dashboard" component={Dashboard} />
                      <PrivateRoute exact path="/tmpchart" component={Tmpchart} />
                      <PrivateRoute exact path="/screen" component={Screen} />
                      <PrivateRoute exact path="/big-screen" component={BigScreen} />
                      <Route exact path="/big-screen/:id" render={(props) => {
                        return (
                          <BigScreenDetail
                            {...props}
                            mount={() => {
                              setMainNoBackground(true);
                            }}
                            unmount={() => {
                              setMainNoBackground(false);
                            }}
                          />
                        );
                      }} />
                      <Route path="/srm" render={(props) => {
                        return (
                          <SRM {...props} />
                        );
                      }} />
                      <PrivateRoute exact path="/screen/:screenId" component={ScreenDetail} />
                      <PrivateRoute exact path="/history/cur" component={HistoryCur} />
                      <PrivateRoute exact path="/history/all" component={HistoryAll} />
                      <PrivateRoute exact path="/history/:historyType/:historyId" component={HistoryDetail} />
                      <PrivateRoute exact path="/strategy" component={Strategy} />
                      <PrivateRoute exact path="/strategy/add" component={StrategyAdd} />
                      <PrivateRoute exact path="/nginx" component={NginxLog as any} />
                      <PrivateRoute exact path="/nginx/add" component={NginxLogAdd as any} />
                      <PrivateRoute exact path="/binlog" component={Binlog as any} />
                      <PrivateRoute exact path="/binlog/add" component={BinlogAdd as any} />
                      <PrivateRoute exact path="/strategy/:strategyId/clone" component={StrategyClone} />
                      <PrivateRoute exact path="/strategy/:strategyId" component={StrategyModify} />
                      <PrivateRoute exact path="/silence" component={Silence} />
                      <PrivateRoute exact path="/silence/add" component={SilenceAdd} />
                      <PrivateRoute exact path="/collect/:type" component={Collect} />
                      <PrivateRoute exact path="/collectRule/add" component={SbugroupForm as any} />
                      <PrivateRoute exact path="/collectRule/subgroup" component={CollectRule as any} />
                      <PrivateRoute exact path="/collect/:action/:type" component={CollectFormMain} />
                      <PrivateRoute exact path="/collect/:action/:type/:id" component={CollectFormMain} />
                      <PrivateRoute exact path="/snmp" component={SNMP as any} />
                      <PrivateRoute exact path="/snmp/:action" component={SNMPFormMain} />
                      <PrivateRoute exact path="/snmp/:action/:id" component={SNMPFormMain} />
                      <PrivateRoute exact path="/api" component={API as any} />
                      <PrivateRoute exact path="/api/:action" component={APIFormMain} />
                      <PrivateRoute exact path="/api/:action/:id" component={APIFormMain} />
                      <PrivateRoute exact path="/aggr-stra" component={AggrStra as any} />
                  </Switch>
                </LayoutMain>
              </Switch>
            </BrowserRouter>
          </Provider>
        </ConfigProvider>
      </InjectIntlContext>
    </IntlProvider>
  );
}

export default App;
