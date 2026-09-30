module.exports = {
  // @ledgerhq ships untranspiled class fields; webpack 4 can't parse them.
  transpileDependencies: [/@ledgerhq/],
  devServer: {
    disableHostCheck: true
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@ledgerhq/devices/hid-framing': '@ledgerhq/devices/lib/hid-framing'
      }
    }
  }
}
