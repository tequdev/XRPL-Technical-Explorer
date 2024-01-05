// import fs from 'fs'
import path from 'path'
import { XrplClient } from 'xrpl-client'
import { AppLMDBService } from './src/libs/lmdb'

const WSS_RPC_URL_ONE = 'ws://localhost:6108'
const WSS_RPC_URL_TWO = 'ws://localhost:6208'

// Function to save the validation message to a JSON file
function saveValidationMessage(message: any, clientId: string): void {
  const baseDirectory = path.join('validations', String(message.ledger_index))
  const ledgerDirectory = path.join(baseDirectory, clientId)
  const filename = `${message.master_key}.json`
  const filepath = path.join(ledgerDirectory, filename)
  const client = new AppLMDBService('1')
  client.open()
  client.create(`/${filepath}`, Buffer.from(JSON.stringify(message)))
}

function connectAndSubscribe(url: string, clientId: string): void {
  const client = new XrplClient(url)

  client.on('online', () => {
    console.log('Connected to Xahaud on wss://xahau.network')

    // Subscribe to the transactions stream
    client
      .send({ command: 'subscribe', streams: ['validations'] })
      .then((response) => {
        console.log('Subscribed to validations stream:', response)
      })
      .catch((error) => {
        console.error('Error subscribing to validations:', error)
      })
  })

  // Listen to transactions
  client.on('validation', async (message) => {
    saveValidationMessage(message, clientId)
  })

  client.on('error', function error(err) {
    console.error(`WebSocket error for client ${clientId}:`, err)
  })

  client.on('close', function close() {
    console.log(`WebSocket connection closed for client ${clientId}`)
  })
}

function runClients(): void {
  connectAndSubscribe(WSS_RPC_URL_ONE, '6108')
  connectAndSubscribe(WSS_RPC_URL_TWO, '6208')
  connectAndSubscribe(WSS_RPC_URL_TWO, '6308')
  connectAndSubscribe(WSS_RPC_URL_TWO, '6408')
  connectAndSubscribe(WSS_RPC_URL_TWO, '6508')
  connectAndSubscribe(WSS_RPC_URL_TWO, '6608')
}

runClients()
