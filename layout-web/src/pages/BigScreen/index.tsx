import React from 'react';
import * as singleSpa from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import { fetchManifest, getPathBySuffix, createStylesheetLink } from '@pkgs/utils';

const bigScreenConf = {
  development: {
    publicPath: 'http://localhost:8001/monitor-dashboard/',
    index: 'http://localhost:8001/monitor-dashboard/index.html',
  },
  production: {
    publicPath: '/monitor-dashboard/',
    index: '/monitor-dashboard/index.html',
  },
};

export default function index(props: any) {
  return (
    <Parcel
      config={async () => {
        const sysUrl = bigScreenConf[process.env.NODE_ENV].index;
        const htmlData = await fetchManifest(sysUrl, bigScreenConf[process.env.NODE_ENV].publicPath);
        const lifecyclesFile = await System.import(htmlData);
        const jsPath = await getPathBySuffix(bigScreenConf, lifecyclesFile.default, '.js');
        const cssPath = await getPathBySuffix(bigScreenConf, lifecyclesFile.default, '.css');
        createStylesheetLink('ticket', cssPath);
        const reactLifecycles = await System.import(jsPath);
        return reactLifecycles;
      }}
      mountParcel={singleSpa.mountRootParcel}
      {...props}
      mode={props.mode}
    />
  );
}
