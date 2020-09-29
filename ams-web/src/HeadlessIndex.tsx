import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import request from '@pkgs/request';
import api from '@pkgs/api';
import '@pkgs/Layout/style.less';
import App from './app';

function HeadlessIndex() {
  useEffect(() => {
    request(api.permissionPoint).then((res) => {
      const permissionPoint: any = {};
      _.forEach(res, (val, key) => {
        permissionPoint[key] = true;
      });
      window.postMessage({
        type: 'permissionPoint',
        value: permissionPoint,
      }, window.origin);
    });
  })
  return (
    <>
      <div style={{ height: 50, lineHeight: '50px', backgroundColor: '#282b33', color: '#fff' }}>headless</div>
      <App />
    </>
  );
}

ReactDOM.render(
  <HeadlessIndex />,
  document.getElementById('react-content'),
);
