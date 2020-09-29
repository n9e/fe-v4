var webpackConfigResolveAlias = require('./webpackConfigResolveAlias');
const CoverHtmlWebpackPlugin = require('./CoverHtmlWebpackPlugin.js');

module.exports = function(webpackConfig) {
  webpackConfig.output.publicPath = '/layout/';
  webpackConfig.resolve.alias = webpackConfigResolveAlias;
  webpackConfig.module.rules.unshift({
    parser: { system: false },
  });
  webpackConfig.plugins.push(
    new CoverHtmlWebpackPlugin(),
  );
  return webpackConfig;
}
