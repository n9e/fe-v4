var path = require('path');
var cwd = process.cwd();

module.exports = {
  react: path.resolve('./node_modules/react'),
  'react-dom': '@hot-loader/react-dom',
  '@common': path.resolve(cwd, 'src/common'),
  '@BComponent': path.resolve(cwd, 'src/components/BaseComponent'),
  '@interface': path.resolve(cwd, 'src/interface'),
  '@pkgs': path.resolve(cwd, 'src/packages'),
  '@cpts': path.resolve(cwd, 'src/components'),
};
