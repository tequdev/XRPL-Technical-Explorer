<template>
  <div class="fixed-top nav-v-scroller bg-body shadow-sm" style="z-index: 10">
    <nav class="nav nav-underline" aria-label="Secondary navigation">
      <div class="ms-2 pe-3" v-show="$ledger.list.length > 0">
        <i class="pinned-ledgers fas fa-thumbtack d-inline mt-3 float-start text-dark"></i>
        <div class="btn-group ms-2 py-1">
          <!-- <span class="pinned-ledger px-0 py-0 mt-1 btn btn-primary fw-bold active" aria-current="page">
            <a href="#" class="px-2 text-white">Active link</a>
            <a href="#" class="text-white me-2">&times;</a>
          </span> -->
          <span v-for="ledger in $ledger.list" v-bind:key="ledger" class="pinned-ledger px-0 py-0 mt-1 btn" :class="{ 'btn-warning': currentLedger !== ledger, 'btn-primary shadow-sm fw-bold active': currentLedger === ledger }">
            <router-link :to="'/' + String(ledger)" class="text-decoration-none ps-2 pe-1" :class="{ 'text-dark': currentLedger !== ledger, 'text-white': currentLedger === ledger }">
              {{ ledger }}
              <span v-if="$ledger.list.indexOf(Number(ledger)) > -1" style="top: -3px; left: -4px;" class="badge bg-blue fw-bold ms-0 me-0 d-inline px-1 pt-0 pb-0 text-dark bg-white rounded-pill align-text-bottom">{{ typeof getValidationCount(ledger) === 'number' ? getValidationCount(ledger) : '…' }}</span>
            </router-link>
            <button @click="purge(ledger)" class="me-2 border-0 bg-transparent px-0 py-0" :class="{ 'text-dark': currentLedger !== ledger, 'text-white': currentLedger === ledger }">&times;</button>
          </span>
        </div>
      </div>
      <span v-if="!connected" class="blue await-close ms-3 pt-2"><small>Connecting...</small></span>
      <span v-if="connected && validations.length === 0" class="blue await-close ms-3 pt-2"><small>Waiting for the next ledger to close...</small></span>
      <router-link :to="'/' + String(l.ledger_index)" v-for="l in validations" v-bind:key="l.ledger_index" class="nav-link px-0">
        <div class="ps-2 pe-1" v-if="$ledger.list.indexOf(l.ledger_index) > -1">
          <span disabled class="text-muted"><small><i class="far fa-thumbtack"></i> {{ l.ledger_index }}</small></span>
        </div>
        <div class="px-3" v-else>
          <span class="blue" :class="{'fw-bold': getValidationCount(l) > 0}">{{ l.ledger_index }}</span>
          <span v-if="getValidationCount(l) > 0" class="badge bg-blue fw-bold ms-1 text-white rounded-pill align-text-bottom">{{ getValidationCount(l) }}</span>
        </div>
      </router-link>
    </nav>
  </div>
</template>

<script>

import axios from 'axios'

export default {
  name: 'Validations',
  data () {
    return {
      validations: [],
      connected: false
    }
  },
  methods: {
    async addValidation (ledger) {
      if (this.validations.indexOf(ledger) < 0) {
        const response = await axios.get('http://localhost:9000/validations', {
          params: {
            ledger: ledger.ledger_index - 1
          }
        })
        this.validations.unshift({
          ledger_index: ledger.ledger_index - 1,
          validations: response.data
        })
        this.validations.splice(20)
      }
    },
    purge (ledgerIndex) {
      this.$validation.purge(ledgerIndex)
      if (this.$router.currentRoute?.params?.validation === String(ledgerIndex)) {
        this.$router.push('/')
      }
    },
    getValidation (ledgerIndex) {
      const matchedValidations = this.validations.filter(l => l.ledger_index === ledgerIndex)
      console.log(matchedValidations)
      if (matchedValidations) {
        return matchedValidations[0]
      }
    },
    groupValidationsByMasterKey (validations) {
      const grouped = validations.reduce((acc, validation) => {
        const key = validation.master_key

        if (!acc[key]) {
          acc[key] = []
        }

        // Push the current validation into the appropriate group
        acc[key].push(validation)

        return acc
      }, {})

      return grouped
    },
    getValidationCount (ledgerIndex) {
      const index = this.validations.findIndex(l => l.ledger_index === ledgerIndex.ledger_index)
      if (index < 0) {
        return 0
      }
      // const filterValidations = this.groupValidationsByMasterKey(this.validations[index].validations)
      // return Object.keys(filterValidations).length
      return this.validations[index].validations.length
    }
  },
  computed: {
    currentValidation () {
      return Number(this.$route?.params?.validation || 0)
    }
  },
  components: {
  },
  mounted () {
    if (typeof this.$ws !== 'undefined') {
      if (this.$ws.getState().online) {
        this.connected = true
      }
    }

    this.$events.on('ledger', this.addValidation)

    this.$events.on('connected', () => {
      this.connected = true
    })
  },
  destroyed () {
    this.$events.off('ledger', this.addValidation)
  }
}
</script>

<style lang="scss" scoped>
  .pinned-ledgers { top: -0.05em; position: relative; }
  .pinned-ledger { height: 1.8em; top: 0.03em }
  .await-close { opacity: 0.5; line-height: 1.7em; }
</style>
