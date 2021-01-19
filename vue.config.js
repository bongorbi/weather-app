/* eslint-disable */
// vue.config.js
const { version } = require('./package.json');
module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    }
  },
  chainWebpack: config => {
    config.plugin('html')
      .tap(args => {
        args[0].title = 'Weather app';
        args[0].version = version;
        return args;
      });
  },
  lintOnSave: 'warning',
  parallel: false
};
