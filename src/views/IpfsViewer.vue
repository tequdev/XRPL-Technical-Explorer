<template>
  <main class="container-fluid pb-5">
    <div class="row">
      <div class="col-9">
        <div v-if="possibleCommands.length > 0">
          <h4 class="nes blue">Custom Payload</h4>
          <code class="text-primary nes">Pick one</code>
          <p class="pt-3">
            Which one are you looking for?
          </p>
          <ul class="list-unstyled">
            <li v-for="entry in possibleCommands" v-bind:key="entry">
              <router-link :to="'/' + entry" class="nes-btn py-0 mb-3 nes is-warning">{{ entry }}</router-link>
            </li>
          </ul>
        </div>
        <div v-else>
          <h4 class="nes blue">
            <a class="nes-btn is-warning float-end btn-sm py-1" :href="'https://docs.xumm.dev/'" target="_blank"><i style="position: relative; top: -2px;" class="fas fa-external-link-alt me-2"></i><code class="d-none text-primary pe-2">Custom Payload</code>Docs</a>
          </h4>
          <code class="text-primary nes">Ipfs Viewer</code>
          <div class="mt-3">
            <div class="rounded" style="overflow: hidden;">
              <codemirror v-model="command" :options="cmOptions"></codemirror>
            </div>
            <div class="mt-2">
              <Loading v-if="loading" />
              <div :class="{ 'border-danger': errorResponse }" class="card mt-4 shadow-sm" v-if="!loading && Object.keys(data).length > 0">
                <h5 :class="{ 'bg-danger text-white': errorResponse }" class="card-header nes h6">{{ errorResponse ? 'Error' : 'Results' }}</h5>
                <div class="card-body" style="overflow-x: auto;">
                  <JsonRenderer :data="data" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<style lang="scss" scoped>
.scrollable-section {
  max-height: 100vh; /* Adjust this value according to your needs */
  overflow-y: auto;
}
</style>
<script>
import { codemirror } from 'vue-codemirror'
import Loading from '../components/Loading.vue'
import { groupedCommands } from '../plugins/commands'

import 'codemirror/lib/codemirror.css'
import JsonRenderer from '../components/JsonRenderer.vue'
import 'codemirror/theme/monokai.css'
import 'codemirror/addon/lint/lint.css'

import jsonlint from 'jsonlint-mod'

import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/json-lint.js'
import 'codemirror/keymap/sublime.js'

window.jsonlint = jsonlint

export default {
  name: 'CustomCommand',
  components: {
    codemirror,
    JsonRenderer,
    Loading
  },
  data () {
    return {
      command: '',
      cmOptions: {
        tabSize: 2,
        mode: 'application/json',
        theme: 'monokai',
        lineNumbers: true,
        line: true,
        keymap: 'sublime',
        lineWrapping: false,
        lint: true
      },
      loading: false,
      imageUrl: null,
      data: {},
      errorResponse: false,
      groupedCommands: groupedCommands
    }
  },
  computed: {
    paramToTemplate () {
      return this.$route.meta?.replaceProp && this.$route.meta?.replaceParam && this.$route.params?.[this.$route.meta.replaceParam]
    },
    possibleCommands () {
      if (this.$route?.query?.c) {
        return this.$router.options.routes.filter(r => {
          return r?.meta?.isPublicCommand
        }).map(r => r.name.split('_').slice(1).join('_')).filter(r => this.$route.query.c.indexOf(r) > -1).sort()
      }

      return []
    },
    commandName () {
      return this.$route.name.split('_').slice(1).join('_')
    }
  },
  methods: {
    async prepare () {
      const entry = await this.$ws.send({
        command: 'ledger_entry',
        index: this.$router.currentRoute.params.entry
      })
      const buffer = Buffer.from(entry.node.Data, 'hex')
      const jsonString = buffer.toString('utf8')
      const originalIpfsData = JSON.parse(jsonString)
      this.command = JSON.stringify(originalIpfsData, null, 2)
    }
  },
  async mounted () {
    this.prepare()
  }
}
</script>

<style lang="scss" scoped>
</style>
