import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { auth } from '@pkgs/Auth';
import App from './app';

function domElementGetter() {
  let el = document.getElementById('ecmc-layout-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ecmc-layout-container';
    document.body.appendChild(el);
  }

  return el;
}

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: () => {
    auth.checkAuthenticate();
    return <App />;
  },
  domElementGetter,
});

export const bootstrap = [
  reactLifecycles.bootstrap,
];

export const mount = [
  reactLifecycles.mount,
];

export const unmount = [
  reactLifecycles.unmount,
];
