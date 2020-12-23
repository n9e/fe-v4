import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import { isValidBrowser } from '@pkgs/config';
import api from '@pkgs/api';
import App from './app';
import './style.less'


function invalidModal(downloadBrowserUrl?: { edge: string, chrome: string }) {
  Modal.warning({
    width: 600,
    title: <p className='sso-modal-content-top'>'Hi~,您的浏览器版本过低'</p>,
    content: (
      <div className="sso-modal-content">
        <p className="sso-modal-content-center">建议您对浏览器进行升级，以便获得更好的使用体验。</p>
        <p className="sso-modal-content-backColor"></p>
        <p className="sso-modal-content-bottom">推荐以下浏览器和版本</p>
        {
          downloadBrowserUrl ?
            <div className="sso-modal-bottom">
              <a href={downloadBrowserUrl.edge}>
                <img src="../src/uploadImg/IE.png" />
                <p>IE Edge</p>
              </a>
              <a href={downloadBrowserUrl.chrome}>
                <img src="../src/uploadImg/google.png" />
                <p>Google Chrome</p>
              </a>
            </div> : null
        }
      </div>
    ),
  });
}

if (!isValidBrowser) {
  fetch(api.downloadBrowser).then((res) => {
    return res.json();
  }).then((res) => {
    invalidModal(res.dat);
  }).catch((e) => {
    console.log(e);
    invalidModal();
  });
}

ReactDOM.render(
  <App />,
  document.getElementById('layout'),
);
