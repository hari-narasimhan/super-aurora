'use strict'
const MongoDB = require('mongodb')
const MongoClient = MongoDB.MongoClient

class ConnectionManager {

  get client () {
    return this._client
  }

  set client (client) {
    this._client = client
  }

  async init (_options) {
    const { uri, ...options } = _options
    this.client = await MongoClient.connect(uri, options)
  }

  getCollection(context) {
    return this.client.db(context.db).collection(context.coll)
  }
  close() {
    return this.client.close()
  }
}

module.exports = ConnectionManager