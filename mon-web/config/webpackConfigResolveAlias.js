var path = require('path');
var cwd = process.cwd();

module.exports = {
  react: path.resolve('./node_modules/react'),
  'react-dom': '@hot-loader/react-dom',
  '@common': path.resolve(cwd, 'src/common'),
  '@cpts': path.resolve(cwd, 'src/components'),
  '@pkgs': path.resolve(cwd, 'src/packages'),
  '@interface': path.resolve(cwd, 'src/interface'),
};
