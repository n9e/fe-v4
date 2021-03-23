/**
 * 重置 html 内容
 * 注意: HtmlWebpackPlugin hooks 是 beta 版本，正式版本接口可能会变
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonDepsMap = [
  {
    name: 'react',
    development: '/static/js/react.development.js',
    production: '/static/js/react.production.min.js',
  }, {
    name: 'react-dom',
    development: '/static/js/react-dom.development.js',
    production: '/static/js/react-dom.production.min.js',
  }, {
    name: 'single-spa',
    development: '/static/js/single-spa.min.js',
    production: '/static/js/single-spa.min.js',
  }, {
    name: 'moment',
    development: '/static/js/moment.js',
    production: '/static/js/moment.min.js',
  }, {
    name: 'antd',
    development: '/static/js/antd.js',
    production: '/static/js/antd.min.js',
  }, {
    name: 'd3',
    development: '/static/js/d3.js',
    production: '/static/js/d3.min.js',
  }
];

function generateSystemJsImportMap() {
  const importMap = {};
  commonDepsMap.forEach((o) => {
    importMap[o.name] = o[process.env.NODE_ENV];
  });
  return JSON.stringify({
    imports: importMap,
  });
}

class CoverHtmlWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('CoverHtmlWebpackPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('CoverHtmlWebpackPlugin', async (data, cb) => {
        const depsMap = `
          <script type="systemjs-importmap">
            ${generateSystemJsImportMap()}
          </script>
        `;
        const portalMap = {
          '@portal/layout': '/layout.js',
        };
        const assetJson = JSON.parse(data.plugin.assetJson);
        let links = '';

        assetJson.forEach((item) => {
          if (/\.js$/.test(item)) {
            // TODO: entry 只有一个
            portalMap['@portal/layout'] = item;
          } else if (/\.css$/.test(item)) {
            links += `<link href="${item}" rel="stylesheet">`
          }
        });
        data.html = `
          <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width" />
                <title></title>
                ${links}
                <script src='/static/js/system.min.js'></script>
                <script src='/static/js/named-exports.min.js'></script>
                <script src='/static/js/use-default.min.js'></script>
                <script src='/static/js/amd.js'></script>
              </head>
              <body>
                ${depsMap}
                <script type="systemjs-importmap">
                  {
                    "imports": ${JSON.stringify(portalMap)}
                  }
                </script>
                <script>
                  System.import('@portal/layout');
                </script>
                <div id="layout"></div>
              </body>
            </html>
          `;
        cb(null, data);
      });
    });
  }
}

module.exports = CoverHtmlWebpackPlugin;
