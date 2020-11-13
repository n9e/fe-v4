import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import * as singleSpa from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import intlZhCN from './locales/zh';
import intlEnUS from './locales/en';
import { fetchManifest, getPathBySuffix, createStylesheetLink } from '@pkgs/utils';
import { InjectIntlContext } from '@pkgs/hooks/useFormatMessage';
import { PrivateRoute } from '@pkgs/Auth';
import LayoutMain from '@pkgs/Layout/Main';
import { appname } from './common/config';
import TaskTpl from './pages/TaskTpl';
import TaskTplAdd from './pages/TaskTpl/Add';
import TaskTplDetail from './pages/TaskTpl/Detail';
import TaskTplModify from './pages/TaskTpl/Modify';
import Task from './pages/Task';
import TaskAdd from './pages/Task/Add';
import TaskResult from './pages/Task/Result';
import TaskDetail from './pages/Task/Detail';

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
const systemsConfItem = {
  ident: 'deploy',
  development: {
    publicPath: 'http://localhost:7002/deploy/',
    index: 'http://localhost:7002/deploy/index.html',
  },
  production: {
    publicPath: '/deploy/',
    index: '/deploy/index.html',
  },
};

function App() {
  const [menus, setMenus] = useState<any>([]);
  const [language, setLanguage] = useState(defaultLanguage);
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);
  const title = language === 'zh' ? '任务执行中心' : 'JOB';

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'language') {
        setLanguage(data.value);
      }
    }, false);
  });

  useEffect(() => {
    fetch('/static/jobMenusConfig.json').then((res) => {
      return res.json();
    }).then((res) => {
      setMenus(res);
    });

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
                <LayoutMain
                  systemName={appname}
                  systemNameChn={title}
                  treeVisible
                  menus={menus}
                >
                  <Switch>
                    <Route exact path="/" render={() => <Redirect to="/tasks" />} />
                    <PrivateRoute exact path="/tpls" component={TaskTpl as any} />
                    <PrivateRoute exact path="/tpls/add" component={TaskTplAdd as any} />
                    <PrivateRoute exact path="/tpls/:id/detail" component={TaskTplDetail as any} />
                    <PrivateRoute exact path="/tpls/:id/modify" component={TaskTplModify as any} />
                    <PrivateRoute exact path="/tasks" component={Task as any} />
                    <PrivateRoute exact path="/tasks-add" component={TaskAdd as any} />
                    <PrivateRoute exact path="/tasks/:id/result" component={TaskResult as any} />
                    <PrivateRoute exact path="/tasks/:id/detail" component={TaskDetail as any} />
                    <Route path="/deploy" render={(props: any) => {
                      return (
                        <Parcel
                          config={async () => {
                            const sysUrl = systemsConfItem[process.env.NODE_ENV].index;
                            const htmlData = await fetchManifest(sysUrl, systemsConfItem[process.env.NODE_ENV].publicPath);
                            const lifecyclesFile = await System.import(htmlData);
                            const jsPath = await getPathBySuffix(systemsConfItem, lifecyclesFile.default, '.js');
                            const cssPath = await getPathBySuffix(systemsConfItem, lifecyclesFile.default, '.css');
                            createStylesheetLink('deploy', cssPath);
                            const reactLifecycles = await System.import(jsPath);
                            return reactLifecycles;
                          }}
                          mountParcel={singleSpa.mountRootParcel}
                          history={props.history}
                        />
                      );
                    }} />
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
