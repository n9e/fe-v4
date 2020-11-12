const process = require('process');
const StatsPlugin = require('stats-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackConfigResolveAlias = require('./webpackConfigResolveAlias');
const fetkJson = require('../fetk.config');
const pkgJson = require('../package.json');


module.exports = function getwebpackConfig(webpackConfig) {
  webpackConfig.resolve.alias = webpackConfigResolveAlias;
  // webpackConfig.resolve.mainFields = ['browser', 'main', 'module'];

  if (!process.env.Mode) {
    webpackConfig.output.library = pkgJson.systemName;
    webpackConfig.output.libraryTarget = 'amd';
    webpackConfig.module.rules.unshift({
      parser: { system: false },
    });
    webpackConfig.output.publicPath = `http://0.0.0.0:${fetkJson.port}/${pkgJson.systemName}/`;
    webpackConfig.output.filename = '[name]-[chunkhash].js';
    webpackConfig.plugins = webpackConfig.plugins.filter((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin ||
          plugin instanceof MiniCssExtractPlugin) {
        return false;
      }
      return true;
    });
    webpackConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name]-[chunkhash].css',
        chunkFilename: '[name]-[chunkhash].css',
      }),
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
            exclude: [/node_modules/]
        }
      )
    );
  }
  return webpackConfig;
};
