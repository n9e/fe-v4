import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import Layout from '@pkgs/Layout';
import { InjectIntlContext } from '@pkgs/hooks/useFormatMessage';
import { Login, Register, CallBack, ChangePassword } from '@pkgs/Auth';
import { Page403, Page404 } from '@pkgs/Exception';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { getDefaultTenantProject, getTenantProjectByProjectId } from '@pkgs/utils';
import TaskOutput from './pages/TaskOutput';
import TaskHostOutput from './pages/TaskOutput/host';
import BigScreen from './pages/BigScreen';
import intlZhCN from './locales/zh';
import intlEnUS from './locales/en';
import registerApps from '../config/registerApps';

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

const noProjCheck = (projsData: any) => {
  // TODO: 临时写死几个系统不需要检验是否加入过项目
  const disabledSystems = ['mis', 'crds', 'rdb', 'ams', 'job', 'mon'];
  const { pathname } = window.location;
  const checked = _.some(disabledSystems, (item) => {
    if (pathname.indexOf(`/${item}/`) === 0 || pathname === `/${item}`) {
      return true;
    }
    return false;
  });
  if (!checked) {
    // TODO: 未加入任何项目则跳转到 403 页面
    if (!projsData || _.isEmpty(projsData)) {
      window.location.href = '/403?cause=noproj';
      return;
    }
  }
};

export const { Provider, Consumer } = React.createContext('zh');

export default function App() {
  // const [language, setlanguage] = useState(window.localStorage.getItem('language') || navigator.language.substr(0, 2));
  const [language, setlanguage] = useState('zh');
  const [belongProjects, setBelongProjects] = useState([]);
  const [tenantProjectVisible, setTenantProjectVisible] = useState(true);
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);
  const [feConf, setFeConf] = useState({});
  const pageTitle = _.get(feConf, 'title');
  const defaultTenant = _.attempt(
    JSON.parse.bind(
      null,
      localStorage.getItem('icee-global-tenant') as string,
    ),
  );
  const defaultProject = _.attempt(
    JSON.parse.bind(
      null,
      localStorage.getItem('icee-global-project') as string,
    ),
  );
  const [selectedTenantProject, setSelectedTenantProject] = useState({
    tenant: defaultTenant,
    project: defaultProject,
  });
  const setSelectedTenantProjectFunc = (newSelectedTenantProject: any) => {
    localStorage.setItem(
      'icee-global-tenant',
      JSON.stringify(newSelectedTenantProject.tenant),
    );
    localStorage.setItem(
      'icee-global-project',
      JSON.stringify(newSelectedTenantProject.project),
    );
    setSelectedTenantProject(newSelectedTenantProject);
  };

  if (pageTitle) {
    document.title = pageTitle;
  }

  useLayoutEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'tenantProjectVisible') {
        setTenantProjectVisible(data.value);
      }
    }, false);
    fetch('/static/feConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setFeConf(res);
      });
  }, []);

  useEffect(() => {
    window.postMessage({
      type: 'tenantProject',
      value: selectedTenantProject,
    }, window.location.origin);
  }, [selectedTenantProject]);

  useEffect(() => {
    window.localStorage.setItem('language', language);
    window.postMessage({
      type: 'language',
      value: language,
    }, window.location.origin);
  }, [language]);

  return (
    <IntlProvider
      locale={_.get(localeMap[language], 'intl', 'zh')}
      messages={intlMessages}
    >
      <ConfigProvider locale={_.get(localeMap[language], 'antd', antdZhCN)}>
        <InjectIntlContext>
          <Provider value={language}>
            <BrowserRouter>
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/auth-callback" component={CallBack} />
                <Route path="/change-password" component={ChangePassword} />
                <Route path="/register" component={Register} />
                <Route path="/403" component={Page403} />
                <Route path="/404" component={Page404} />
                <Route exact path="/task-output/:taskId/:outputType" component={TaskOutput} />
                <Route exact path="/task-output/:taskId/:host/:outputType" component={TaskHostOutput} />
                <Route exact path="/big-screen/:id" render={(props: any) => {
                  return <BigScreen {...props} mode="full-screen" />;
                }} />
                <Route exact path="/big-screen/modify/:id" render={(props: any) => {
                  return <BigScreen {...props} mode="editable" />;
                }} />
                <Route exact path="/" render={() => <Redirect to="/rdb" />} />
                <Layout
                  language={language}
                  onLanguageChange={setlanguage}
                  tenantProjectVisible={tenantProjectVisible}
                  belongProjects={belongProjects}
                  selectedTenantProject={selectedTenantProject}
                  setSelectedTenantProject={setSelectedTenantProjectFunc}
                  onMount={async () => {
                    const projsData = await request(`${api.tree}/projs`);
                    noProjCheck(projsData);
                    setBelongProjects(projsData);

                    // 监听子系统修改租户和项目
                    window.addEventListener('message', (event) => {
                      const { data } = event;
                      if (_.isPlainObject(data) && data.type === 'tenantProjectUpdate') {
                        const tenantProjectByProject = getTenantProjectByProjectId(projsData, data.value);
                        setSelectedTenantProjectFunc(tenantProjectByProject);
                      }
                    }, false);

                    // 设置租户和项目默认值
                    if (
                      (!defaultTenant && !defaultProject)
                      || !_.find(projsData, { id: _.get(defaultProject, 'id') })
                    ) {
                      const defaultTenantProject = getDefaultTenantProject(projsData);
                      setSelectedTenantProjectFunc(defaultTenantProject);
                    }

                    // 注册子系统
                    registerApps({}, () => {
                      request(api.permissionPoint).then((res) => {
                        const permissionPoint: any = {};
                        _.forEach(res, (_val, key) => {
                          permissionPoint[key] = true;
                        });
                        window.postMessage({
                          type: 'permissionPoint',
                          value: permissionPoint,
                        }, window.location.origin);
                      });
                      window.postMessage({
                        type: 'tenantProject',
                        value: {
                          tenant: _.attempt(JSON.parse.bind(null, localStorage.getItem('icee-global-tenant') as string)),
                          project: _.attempt(JSON.parse.bind(null, localStorage.getItem('icee-global-project') as string))
                        }
                      }, window.location.origin);
                    });
                  }}
                >
                  <div id="ecmc-layout-container" />
                </Layout>
                <Route render={() => <Redirect to="/404" />} />
              </Switch>
            </BrowserRouter>
          </Provider>
        </InjectIntlContext>
      </ConfigProvider>
    </IntlProvider>
  );
}
