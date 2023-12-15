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
          <code class="text-primary nes">Ipfs Payload</code>
          <div class="mt-3">
            <div class="rounded" style="overflow: hidden;">
              <codemirror v-model="command" :options="cmOptions"></codemirror>
            </div>
            <div class="d-block text-end">
              <button @click="get()" :disabled="loading" :class="{ 'is-success': !loading, 'is-disabled': loading }" class="mt-3 nes-btn nes"><i class="fas fa-rocket-launch me-2" style="position: relative; top: -3px"></i>Execute</button>
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
      <div class="col-3 d-flex justify-content-center align-items-center">
        <img :src="imageUrl" />
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
import { Xumm } from 'xumm'
import axios from 'axios'
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
    prepare () {
      /*const xumm = new Xumm('03f9aa01-a41e-4666-ad9d-f2de68514d8c')
      xumm.environment.bearer?.then(async (idToken) => {
        console.log(idToken)
      })
      xumm.authorize().catch((error) => {
        this.data = { error: error.message }
        this.loading = false
        this.marker = null
        this.errorResponse = true
      })*/
      this.command = JSON.stringify({
        name: 'DAO Logo',
        description: 'Transia DAO Logo',
        image: 'ipfs://QmVCPkYeGjuZjcu5yXS58rsdi1EUDHtYnU8MY8CFGNVifS',
        collection: {
          name: 'Transia LLC',
          issuer: 'rnBA8kVE8ZxqiRnUccKEo2x1Qa6sJWDXA9',
          taxon: 0,
          family: 'dao'
        }
      }, null, 2)
    },
    async get (marker) {
      this.loading = true
      this.errorResponse = false

      const customCommand = {}
      try {
        Object.assign(customCommand, JSON.parse(this.command))
      } catch (e) {
        this.data = { error: e.message }
        this.loading = false
        this.marker = null
        this.errorResponse = true
        return
      }

      try {
        // const body = { cid: 'QmP9DsM5jkkhaTfiHSwGAEn1eW22cXeFsMAqZZBLHsZriv' }
        const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ0OWU0N2ZiZGQ0ZWUyNDE0Nzk2ZDhlMDhjZWY2YjU1ZDA3MDRlNGQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdGhlbGFiLTkyNGYzIiwiYXVkIjoidGhlbGFiLTkyNGYzIiwiYXV0aF90aW1lIjoxNjk3NzA2NTkyLCJ1c2VyX2lkIjoibEVXeGN0bDcwYU9rTzU3UkhOck1hZEh4cFhsMiIsInN1YiI6ImxFV3hjdGw3MGFPa081N1JITnJNYWRIeHBYbDIiLCJpYXQiOjE2OTk2MTkwNDEsImV4cCI6MTY5OTYyMjY0MSwiZW1haWwiOiI5OGMyNTM3YS1hYzYyLTQ4NzYtYjk0MS1hOTliMzg5OWIwYjUrcjIyM3JzeXoxY2ZxcGJqbWl4Nm95dTFoZmdud2Nrd3poQHh1bW0ubWUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsib2lkYy54dW1tIjpbInIyMjNyc3l6MWNmcVBiam1pWDZvWXUxaEZnTndDa1daSCJdLCJlbWFpbCI6WyI5OGMyNTM3YS1hYzYyLTQ4NzYtYjk0MS1hOTliMzg5OWIwYjUrcjIyM3JzeXoxY2ZxcGJqbWl4Nm95dTFoZmdud2Nrd3poQHh1bW0ubWUiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJvaWRjLnh1bW0iLCJzaWduX2luX2F0dHJpYnV0ZXMiOnsiYXBwX25hbWUiOiJUaGUgTGFiIiwibmV0d29ya19pZCI6IjIxMzM3IiwidXNlcnRva2VuX3V1aWR2NCI6ImI2OTcyNDQ4LTA3YWEtNDMxYy05ZDUwLTYxZDBhYWJmN2NmMSIsIm5ldHdvcmtfZW5kcG9pbnQiOiJ3c3M6Ly94YWhhdS5uZXR3b3JrIiwiYXBwX3V1aWR2NCI6Ijk4YzI1MzdhLWFjNjItNDg3Ni1iOTQxLWE5OWIzODk5YjBiNSIsInNjb3BlIjoiWHVtbVBrY2UiLCJzdGF0ZSI6IjE4MmQwNzIwZGNlY2Y1NmMzNGI1YjkwZTQyMjNmOWJlNDU1OTIzYzdjNzIwNmEyNDAxMDk4NGViODIyMTA5MTBjZTM3OWQ3NTkxOWQzOTA1MTA5ZDhlYWIzNjY3ZWFjM2I2ZGE0NWRlNWMzMTRlMWQ0YWVkNmRmM2YzNTFlYzBhIiwibmV0d29ya190eXBlIjoiWEFIQVUiLCJjbGllbnRfaWQiOiI5OGMyNTM3YS1hYzYyLTQ4NzYtYjk0MS1hOTliMzg5OWIwYjUiLCJwYXlsb2FkX3V1aWR2NCI6IjkwYWZlMDE1LTUyZTktNDMxNC1hNmU4LWY0YTE2M2ZiMzM0YSJ9fX0.mSDN79q_uGGWYad7Jq8ItG-MGhjcNxFe4cW_Ab2hjWWXh-9rNHak-CLRHqoOx7LjcRWzG2R6-ADVYp5z3O-BRJssAPud5ucyN0kdWgGUvjbto6PTO2wt4cZKH7E5oZbhusjhjnZGbzAN7_cPeKaDw3V2OMCN3xSNCHZSSQFl0oHvoK5F7aeYdxgWfzyT1ViILt5teZuL3hJYBdEgC_VGg6PThz3shV1KrrxCR2LBBfiXGcwikFnD2f2fPakvHrfF-ImOriqY9TlCG01VhptJvjd4VeBTZVSRfozYELzcrQF7kn2ZGNsc6Wo9mtcpUxhpGQ3Y9utfS8sOT0VGFsinFg'
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
        const response = await axios.post('http://95.216.222.228:9000/v1/ipns/pin', { key: 'rnBA8kVE8ZxqiRnUccKEo2x1Qa6sJWDXA9', json: customCommand }, config)
        console.log(response)
        this.loading = false
        this.data = response.data
      } catch (error) {
        console.log(error)
        this.data = { error: error.response.data }
        this.loading = false
        this.marker = null
        this.errorResponse = true
      }
    }
  },
  async mounted () {
    this.prepare()
  }
}
</script>

<style lang="scss" scoped>
</style>
