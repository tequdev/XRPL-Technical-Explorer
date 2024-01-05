import express, { Request, Response } from 'express'
import cors from 'cors'
import { Xumm } from 'xumm'
import 'dotenv/config'
import { AppLMDBService } from './libs/lmdb'

const app = express()
const port = 9000

app.use(cors())
app.use(express.json())

// Handle POST requests to /api
app.post('/payload', async (req: Request, res: Response) => {
  try {
    try {
      const xumm = new Xumm(process.env.XUMM_APIKEY, process.env.XUMM_APISECRET)
      const payload = await xumm.payload?.create(req.body, true)
      res.json(payload)
    } catch (error) {
      // @ts-expect-error -- ignore
      res.status(500).json({ error: error.message })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/validations', async (req: Request, res: Response) => {
  try {
    try {
      const client = new AppLMDBService('1')
      client.open()
      const ledgerIndex = req.query.ledger
      const response = await client.list(1, 100, `/validations/${ledgerIndex}`)
      client.close()
      res.json(response)
    } catch (error) {
      // @ts-expect-error -- ignore
      res.status(500).json({ error: error.message })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
