const webpackConfigResolveAlias = require('./webpackConfigResolveAlias');
const CoverHtmlWebpackPlugin = require('./CoverHtmlWebpackPlugin.js');

module.exports = function(webpackConfig) {
  webpackConfig.output.library = 'layout';
  webpackConfig.output.libraryTarget = 'amd';
  webpackConfig.resolve.alias = webpackConfigResolveAlias;
  webpackConfig.module.rules.unshift({
    parser: { system: false },
  });
  webpackConfig.externals = [
    /^react$/,
    /^react\/lib.*/,
    /^react-dom$/,
    /.*react-dom.*/,
    /^single-spa$/,
    /^antd$/,
    /^d3$/
  ];
  webpackConfig.plugins.push(
    new CoverHtmlWebpackPlugin(),
  );
  return webpackConfig;
}
