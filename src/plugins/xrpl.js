import { XrplClient } from 'xrpl-client'

export default {
  async install (Vue, options) {
    Vue.prototype.$ws = new XrplClient(process?.env?.VUE_APP_WSS_ENDPOINT)

    const endpoint = String(process?.env?.VUE_APP_WSS_ENDPOINT || '')

    // VUE_APP_NETWORK (xrpl | xrpl_test | xahau | xahau_test | xahau_dev | local)
    // overrides the endpoint-based guess, for self-hosted networks on any domain.
    const forced = String(process?.env?.VUE_APP_NETWORK || '')
    const net = forced ? { [forced]: true } : {
      xrpl: endpoint === '' || endpoint.match(/xrplcluster|xrpl\.ws|xrpl\.link|s[12]\.ripple\.com/),
      xrpl_test: endpoint.match(/rippletest|\/testnet\.xrpl-labs/),
      xahau: endpoint.match(/xahau.network/),
      xahau_test: endpoint.match(/xahau-test.net/),
      xahau_dev: endpoint.match(/xahau-dev/),
      local: endpoint.match(/localhost|127.0.0.1|custom-node/)
    }

    Vue.prototype.$net = net

    Vue.prototype.$ws.on('ledger', ledger => Vue.prototype.$events.emit('ledger', ledger))
    console.info('Connecting @ `plugins/xrpl`')
    await Vue.prototype.$ws.ready()
    const state = Vue.prototype.$ws.getState()
    console.info('Connected @ `plugins/xrpl`', state.server)
    Vue.prototype.$events.emit('connected', state.server.publicKey)
  }
}
