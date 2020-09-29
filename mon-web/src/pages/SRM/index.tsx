import React from 'react';
import _ from 'lodash';
import * as singleSpa from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import { fetchManifest, getPathBySuffix, createStylesheetLink } from '@pkgs/utils';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';

const systemsConfItem = {
  ident: 'srm',
  development: {
    publicPath: 'http://localhost:9800/srm/',
    index: 'http://localhost:9800/srm/index.html',
  },
  production: {
    publicPath: '/srm/',
    index: '/srm/index.html',
  },
};

function index(props: any) {
  return (
    <Parcel
      config={async () => {
        const sysUrl = systemsConfItem[process.env.NODE_ENV].index;
        const htmlData = await fetchManifest(sysUrl, systemsConfItem[process.env.NODE_ENV].publicPath);
        const lifecyclesFile = await System.import(htmlData);
        const jsPath = await getPathBySuffix(systemsConfItem, lifecyclesFile.default, '.js');
        const cssPath = await getPathBySuffix(systemsConfItem, lifecyclesFile.default, '.css');
        createStylesheetLink('srm', cssPath);
        const reactLifecycles = await System.import(jsPath);
        return reactLifecycles;
      }}
      mountParcel={singleSpa.mountRootParcel}
      history={props.history}
    />
  );
}

export default CreateIncludeNsTree(index, { visible: false }) as any;
