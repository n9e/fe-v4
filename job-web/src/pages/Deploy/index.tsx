import React, { useLayoutEffect, useState } from 'react';
import * as singleSpa from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import _ from 'lodash';
import { fetchManifest, getPathBySuffix, createStylesheetLink } from '@pkgs/utils';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';

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

function index(props: any) {
  const [tenantProject, setTenantProject] = useState({
    tenant: _.attempt(JSON.parse.bind(null, localStorage.getItem('icee-global-tenant') as string)),
    project: _.attempt(JSON.parse.bind(null, localStorage.getItem('icee-global-project') as string))
  });

  useLayoutEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'tenantProject') {
        setTenantProject(data.value);
      }
    }, false);

    window.postMessage({
      type: 'tenantProjectVisible',
      value: true,
    }, window.location.origin);

    return () => {
      window.postMessage({
        type: 'tenantProjectVisible',
        value: false,
      }, window.location.origin);
    }
  }, []);

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
        return reactLifecycles.default;
      }}
      mountParcel={singleSpa.mountRootParcel}
      tenantProject={tenantProject}
      history={props.history}
    />
  );
}

export default CreateIncludeNsTree(index, { visible: false });
