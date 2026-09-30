import { XrplClient } from 'xrpl-client'

export default {
  async install (Vue, options) {
    const defaultEndpoint = process?.env?.VUE_APP_WSS_ENDPOINT
    const customEndpoint = options.router?.options?.endpoint
      ? options.router?.options?.endpoint
      : typeof defaultEndpoint === 'string' && defaultEndpoint.match(/^\/[a-z0-9]/)
        ? window.location.protocol.replace(/^http/, 'ws') + '//' + window.location.host + defaultEndpoint
        : typeof defaultEndpoint === 'string' && defaultEndpoint.match(/^:[0-9]+[/a-z0-9]{0,}/)
          ? window.location.protocol.replace(/^http/, 'ws') + '//' + window.location.host.split(':')[0] + defaultEndpoint
          : ''

    // console.log({
    //   _endpoint,
    //   customEndpoint
    // })

    let endpoint = defaultEndpoint
    if (customEndpoint !== '') { endpoint = options.router.options.endpoint = customEndpoint }
    endpoint = String(endpoint || '')
    // console.log(endpoint)
    Vue.prototype.$ws = new XrplClient(endpoint)
    Vue.prototype.$localnet = false

    Vue.prototype.$ws.send({ command: 'server_info' }).then(r => {
      Vue.prototype.$localnet = r?.info?.last_close?.proposers === 0
      if (Vue.prototype.$localnet) {
        Vue.prototype.$events.emit('islocalnet', true)
      }
    })

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

    net.custom = !net.xrpl && !net.xrpl_test && !net.xahau && !net.xahau_test && !net.xahau_dev && !net.local
    Vue.prototype.$net = net

    const availableNets = [
      { name: 'Xahau Mainnet', wss: 'wss://xahau.network' },
      { name: 'Xahau Testnet', wss: 'wss://xahau-test.net' },
      (defaultEndpoint.match(/xahau-dev/)) ? { name: 'Xahau Devnet', wss: '' } : {},
      { name: 'XRPL Mainnet', wss: 'wss://xrplcluster.com' },
      { name: 'XRPL Testnet', wss: 'wss://s.altnet.rippletest.net:51233' },
      (!defaultEndpoint || defaultEndpoint.match(/localhost|127.0.0.1|custom-node/)) ? { name: 'Localhost', wss: !defaultEndpoint ? '' : defaultEndpoint } : {}
    ].filter(obj => Object.values(obj)[0])

    Vue.prototype.$available_nets = availableNets

    Vue.prototype.$ws.on('ledger', ledger => Vue.prototype.$events.emit('ledger', ledger))
    // console.info('Connecting @ `plugins/xrpl`')
    await Vue.prototype.$ws.ready()
    const state = Vue.prototype.$ws.getState()
    // console.info('Connected @ `plugins/xrpl`', state.server)
    Vue.prototype.$events.emit('connected', state.server.publicKey)
  }
}
