const pkgJson = require('./package');

module.exports = {
  devEntry: {
    [pkgJson.systemName]: process.env.Mode === 'headless' ? './src/HeadlessIndex.tsx' : './src/index.tsx',
  },
  buildEntry: {
    [pkgJson.systemName]: './src/index.tsx',
  },
  webpackDevConfig: 'config/webpack.dev.config.js',
  webpackBuildConfig: 'config/webpack.build.config.js',
  webpackDllConfig: 'config/webpack.dll.config.js',
  theme: 'config/theme.js',
  template: 'src/index.html',
  output: '../pub/job',
  eslintFix: true,
  hmr: false,
  port: 8003,
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
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
