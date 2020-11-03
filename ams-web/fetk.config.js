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
  output: '../pub/ams',
  eslintFix: true,
  hmr: false,
  port: 8002,
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: 'antd',
        style: true,
      },
    ],
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-transform-modules-commonjs'
  ],
  devServer: {
    inline: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  jsLoaderExclude: /node_modules\/(?!react-intl|intl-messageformat|intl-messageformat-parser)/,
};
