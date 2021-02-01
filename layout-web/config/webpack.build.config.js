const StatsPlugin = require('stats-webpack-plugin');
const webpackConfigResolveAlias = require('./webpackConfigResolveAlias');
const CoverHtmlWebpackPlugin = require('./CoverHtmlWebpackPlugin.js');
const pkgJson = require('../package.json');

module.exports = function(webpackConfig) {
  webpackConfig.output.publicPath = '/layout/';
  webpackConfig.resolve.alias = webpackConfigResolveAlias;
  webpackConfig.module.rules.unshift({
    parser: { system: false },
  });
  webpackConfig.plugins.push(
    new CoverHtmlWebpackPlugin(),
  );

  const manifestName = `manifest.json`;
  webpackConfig.plugins.push(
    new StatsPlugin(
      manifestName,
      {
          chunkModules: false,
          source: true,
          chunks: false,
          modules: false,
          assets: true,
          children: false,
          outputPath: false,
          exclude: [/node_modules/]
      }, {
        v: pkgJson.version,
        n: pkgJson.name,
      }
    )
  );
  return webpackConfig;
}
