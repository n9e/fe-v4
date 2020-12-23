import React from 'react';
import ReactDOM from 'react-dom';
import invalidBrowser from '@pkgs/invalidBrowser';
import App from './app';

invalidBrowser();

ReactDOM.render(
  <App />,
  document.getElementById('layout'),
);
