import React, { useState, useLayoutEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import intlZhCN from './locales/zh';
import intlEnUS from './locales/en';
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
import Deploy from './pages/Deploy';

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
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);
  const title = language === 'zh' ? '任务执行中心' : 'JOB';

  useLayoutEffect(() => {
    fetch('/static/jobMenusConfig.json').then((res) => {
      return res.json();
    }).then((res) => {
      setMenus(res);
    });

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
                    <Route path="/deploy" component={Deploy} />
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
