let proxyConf = {};

try {
  proxyConf = require('../proxy.config.js');
} catch (e) {
  console.log('根目录缺少 proxy.config.js 文件');
}

module.exports = {
  devEntry: {
    layout: './src/index.tsx',
  },
  buildEntry: {
    layout: './src/index.tsx',
  },
  webpackDevConfig: 'config/webpack.dev.config.js',
  webpackBuildConfig: 'config/webpack.build.config.js',
  webpackDllConfig: 'config/webpack.dll.config.js',
  theme: 'config/theme.js',
  template: 'src/index.html',
  output: '../pub/layout',
  eslintFix: true,
  hmr: false,
  port: 8000,
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: 'antd',
        style: true,
      },
    ],
  ],
  devServer: {
    inline: true,
    proxy: proxyConf,
    historyApiFallback: true,
  },
};
