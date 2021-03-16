import * as singleSpa from 'single-spa';
import React from 'react';

const customProps = {
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
};

function fetchManifest(url, publicPath) {
  return fetch(url).then((res) => {
    return res.text();
  }).then((data) => {
    if (data) {
      const manifest = data.match(/<meta name="manifest" content="([\w|\d|-]+.json)">/);
      let result = '';
      if (publicPath && manifest) {
        result = `${publicPath}${manifest[1]}`;
      }
      return result;
    }
  });
}

function prefix(location, ident, matchPath) {
  if (matchPath && Object.prototype.toString.call(matchPath) === '[object Function]') {
    return matchPath(location);
  }
  if (location.href === `${location.origin}/${ident}`) {
    return true;
  }
  return location.href.indexOf(`${location.origin}/${ident}/`) !== -1;
}

function getStylesheetLink(ident) {
  return document.getElementById(`${ident}-stylesheet`);
}

function createStylesheetLink(ident, path) {
  const headEle = document.getElementsByTagName('head')[0];
  const linkEle = document.createElement('link');
  linkEle.id = `${ident}-stylesheet`;
  linkEle.rel = 'stylesheet';
  linkEle.href = path;
  headEle.appendChild(linkEle);
}

function removeStylesheetLink(ident) {
  const linkEle = getStylesheetLink(ident);
  if (linkEle) linkEle.remove();
}

async function getPathBySuffix(systemConf, jsonData, suffix) {
  let targetPath = '';
  _.forEach(Object.values(jsonData.assetsByChunkName), (assetsArr) => {
    if(typeof assetsArr === 'string') {
      targetPath = assetsArr
    }
    if(Array.isArray(assetsArr)) {
      targetPath = assetsArr.find((assetStr) => {
        return assetStr.indexOf(systemConf.ident) === 0 && _.endsWith(assetStr, suffix);
      });
      if (targetPath) {
        return false;
      }
    }
  });
  if (process.env.NODE_ENV === 'development') {
    return `${systemConf[process.env.NODE_ENV].publicPath}${targetPath}`;
  }
  return `${systemConf[process.env.NODE_ENV].publicPath}${targetPath}`;
}

export default function registerApps(props = {}, mountCbk) {
  fetch('/static/systemsConfig.json').then((res) => {
    return res.json();
  }).then((res) => {
    res.forEach(async (systemsConfItem) => {
      const { ident, matchPath } = systemsConfItem;
      const sysUrl = systemsConfItem[process.env.NODE_ENV].index;

      singleSpa.registerApplication(ident, async () => {
        let manifestUrl = sysUrl;
        // html 作为入口文件
        if (/.+html$/.test(sysUrl)) {
          manifestUrl = await fetchManifest(sysUrl, systemsConfItem[process.env.NODE_ENV].publicPath);
        }
        const lifecyclesFile = await fetch(manifestUrl).then((res) => res.json());
        let lifecycles = {};
        if (lifecyclesFile) {
          const jsPath = await getPathBySuffix(systemsConfItem, lifecyclesFile, '.js');
          lifecycles = await System.import(jsPath);
        } else {
          lifecycles = lifecyclesFile;
        }
        const { mount, unmount } = lifecycles;
        mount.unshift(async () => {
          if (lifecyclesFile) {
            const cssPath = await getPathBySuffix(systemsConfItem, lifecyclesFile, '.css');
            createStylesheetLink(ident, cssPath);
          }
          return Promise.resolve();
        });

        if (mountCbk) {
          mount.unshift(async () => {
            mountCbk();
            return Promise.resolve();
          });
        }
        unmount.unshift(() => {
          removeStylesheetLink(ident);
          return Promise.resolve();
        });
        return lifecycles;
      }, location => prefix(location, ident, matchPath), {
        ...customProps,
        ...props,
      });
    });

    singleSpa.start();
  });
}
