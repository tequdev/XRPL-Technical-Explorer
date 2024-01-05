import { Dbi, Env, Cursor } from 'node-lmdb'

export class AppLMDBService {
  env: Env;
  db: Dbi;
  openConnections: number;

  constructor (id: string) {
    this.openConnections = 0
  }

  open () {
    if (this.openConnections <= 0) {
      this.env = new Env()
      this.env.open({
        path: 'mylmdb',
        mapSize: 1e9, // maximum database size
        maxDbs: 1,
      })
      this.db = this.env.openDbi({
        name: 'main', // Assuming 'main' as the database name
        create: true,
      })
      this.openConnections = 1
    }
    this.openConnections++
  }

  close () {
    if (this.openConnections <= 1) {
      if (this.db && this.env) {
        this.db.close()
        this.env.close()
        this.db = null
        this.env = null
        this.openConnections = 0
      }
    }
    this.openConnections--
  }

  create (key: string, data: Buffer) {
    if (!this.env || !this.db) throw Error('Database connection is not open.')

    const txn = this.env.beginTxn()
    txn.putBinary(this.db, key, data)
    txn.commit()
  }

  read (key: string): string {
    if (!this.env || !this.db) throw Error('Database connection is not open.')

    const txn = this.env.beginTxn()
    const data = txn.getBinary(this.db, key)
    txn.commit()

    if (!data) {
      throw new Error(`NotFoundException: ${key} does not exist`)
    }
    return data.toString()
  }

  update (key: string, data: Buffer) {
    if (!this.env || !this.db) throw Error('Database connection is not open.')

    const txn = this.env.beginTxn()
    txn.putBinary(this.db, key, data)
    txn.commit()
  }

  delete (key: string) {
    if (!this.env || !this.db) throw Error('Database connection is not open.')

    const txn = this.env.beginTxn()
    txn.del(this.db, key)
    txn.commit()
  }

  async list (page: number, limit: number, startKey: string): Promise<any[]> {
    if (!this.env || !this.db) throw Error('Database connection is not open.')

    const results: any[] = []
    const skip = (page - 1) * limit
    let count = 0

    const txn = this.env.beginTxn()
    const cursor = new Cursor(txn, this.db)

    for (
      let found = cursor.goToRange(startKey);
      found !== null;
      found = cursor.goToNext()
    ) {
      if (found.startsWith(startKey)) {
        if (count >= skip && results.length < limit) {
          const value = cursor.getCurrentBinary()
          results.push(JSON.parse(value.toString()))
        }
        count++
      }
      if (results.length >= limit) {
        break
      }
    }

    cursor.close()
    txn.commit()

    return results
  }
}