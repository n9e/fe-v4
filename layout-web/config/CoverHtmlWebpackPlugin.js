/**
 * 重置 html 内容
 * 注意: HtmlWebpackPlugin hooks 是 beta 版本，正式版本接口可能会变
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

class CoverHtmlWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('CoverHtmlWebpackPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('CoverHtmlWebpackPlugin', async (data, cb) => {
        const assetJson = JSON.parse(data.plugin.assetJson);
        let scripts = '';
        let links = '';
        assetJson.forEach((item) => {
          if (/\.js$/.test(item)) {
            scripts += `<script src="${item}"></script>`;
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
                <script src='/static/promise-polyfill.min.js'></script>
                <script src='/static/system.min.js'></script>
                <script src='/static/named-exports.min.js'></script>
                <script src='/static/use-default.min.js'></script>
                <script src='/static/amd.js'></script>
                <script src='/tinymce/tinymce.min.js'></script>
              </head>
              <body>
                <script type="systemjs-importmap">
                  {
                    "imports": {}
                  }
                </script>
                <script>
                </script>
                <div id="layout"></div>
                ${scripts}
              </body>
            </html>
          `;
        cb(null, data);
      });
    });
  }
}

module.exports = CoverHtmlWebpackPlugin;
