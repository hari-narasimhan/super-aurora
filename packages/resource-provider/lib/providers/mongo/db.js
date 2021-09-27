// cSpell:ignore colkeys, upsert
'use strict'
const ObjectId = require('mongodb').ObjectId
const to = require('await-to-js').default
// const Errors = require('./errors')
// const csvStringify = require('csv-stringify')
const {
  v4: uuidv4
} = require('uuid')
const _ = require('lodash')

const addIdToProjection = (projection = {}) => {
  if (_.keys(projection).length > 0) {
    projection.id = 1
  }
  return projection
}

const convertObjectId = (query) => {
  // converting object id
  let q = {}
  if (query._id) {
    if (typeof query._id === 'string') {
      q._id = ObjectId(query._id)
    } else if (typeof query._id === 'object' && query._id.constructor === Object) {
      if (query._id.$in && typeof query._id.$in === 'object' && query._id.$in.constructor === Array) {
        q = {
          _id: {
            $in: []
          }
        }
        query._id.$in.forEach(id => {
          q._id.$in.push(ObjectId(id))
        })
      } else {
        return query
      }
    }
    return q
  } else {
    return query
  }
}

class Database {
  constructor(connectionManager) {
    if (!connectionManager) {
      throw new Error('Invalid connection manager, cannot construct a Database object')
    }
    this._connectionManager = connectionManager
  }

  get connectionManager() {
    return this._connectionManager
  }

  get ObjectId() {
    return ObjectId
  }

  close() {
    return this.connectionManager.close()
  }
  // TODO implement distinct

  /**
   * find
   * @param {*} options
   */
  async find(context, options = {}) {
    const {
      query,
      projection,
      page,
      limit,
      sort,
      includeCursor
    } = {
      ...options
    }

    const _limit = limit || 10
    const _page = page || 1
    const _query = convertObjectId(query || {})
    const _projection = addIdToProjection(projection)
    const _sort = sort || {
      _id: -1
    }
    const _skip = _page > 0 ? ((_page - 1) * _limit) : 0
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)

    // Getting the total record count if includeCursor = true
    let cursor

    if (includeCursor === true) {
      const [err, totRecords] = await to(this.count(context, {
        query: _query
      }))
      if (err) {
        throw err
      }
      const totalRecords = totRecords.count
      cursor = {
        currentPage: _page,
        perPage: _limit,
        totalRecords
      }
    }

    const [error, result] = await to(collection.find(_query)
      .project(_projection)
      .sort(_sort)
      .skip(_skip)
      .limit(_limit)
      .toArray())

    if (error) {
      throw error
    } else {
      return {
        cursor: cursor,
        records: result
      }
    }
  }

  /**
   * findAsStream
   * @param {*} options
   */
  // async findAsStream(context, options = {}) {
  //   const {
  //     query,
  //     projection,
  //     limit,
  //     sort,
  //     params
  //   } = {
  //     ...options
  //   }
  //   const _limit = limit || 10
  //   const _query = convertObjectId(query || {})
  //   const _projection = addIdToProjection(projection)
  //   const _sort = sort || {
  //     _id: -1
  //   }
  //   const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
  //   // let count = 0
  //   return collection.find(_query)
  //     .project(_projection)
  //     .sort(_sort)
  //     .limit(_limit)
  //     .stream({
  //       transform: function (doc) {
  //         const transformer = _.get(params, 'transformer', _.identity)
  //         return transformer(doc)
  //       }
  //     })
  //     .pipe(csvStringify({
  //       header: true
  //     }))
  // }

  /**
   * count
   * @param {*} options
   */
  async count(context, options = {}) {
    const {
      query
    } = {
      ...options
    }
    const _query = query || {}
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
    const [error, result] = await to(collection.countDocuments(_query))
    if (error) {
      throw error
    } else {
      return {
        count: result
      }
    }
  }

  async findOne(context, options = {}) {
    const {
      query,
      projection
    } = {
      ...options
    }
    const _projection = addIdToProjection(projection)
    const _query = query || {}
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
    const [error, result] = await to(collection.findOne(_query, {
      projection: _projection
    }))
    if (error) {
      throw error
    } else {
      return result
    }
  }

  findById(context, options = {}) {
    const {
      id,
      projection
    } = {
      ...options
    }
    return this.findOne(context, {
      query: {
        id
      },
      projection
    })
  }

  findByParams(context, options = {}) {
    const {
      query,
      projection
    } = {
      ...options
    }
    return this.findOne(context, {
      query,
      projection
    })
  }

  async insert(context, options = {}) {
    const {
      payload
    } = {
      ...options
    }
    if (Array.isArray(payload)) {
      throw new Error('insert does not handle array as payload, use insertMany instead.')
    }
    // add uuid
    payload.id = payload.id || uuidv4()
    // Add timestamps
    if (Object.prototype.toString.call(payload) === '[object Object]') {
      const timeStamp = new Date()
      payload.createdAt = timeStamp
      payload.updatedAt = timeStamp
    }
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
    const [error, result] = await to(collection.insertOne(payload))
    if (error) {
      throw error
    } else {
      return { _id: result.insertedId, ...payload }
    }
  }

  async insertMany(context, options = {}) {
    const {
      payload
    } = {
      ...options
    }
    let _payload = _.cloneDeep(payload)
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
    if (!Array.isArray(_payload)) {
      throw new Error('insertMany expects payload to be an array')
    }

    if (Object.prototype.toString.call(_payload) === '[object Array]') {
      const timeStamp = new Date()
      _payload = _payload.map(function (val) {
        val.id = uuidv4()
        val.createdAt = timeStamp
        val.updatedAt = timeStamp
        return val
      })
    }
    const [error, result] = await to(collection.insertMany(_payload))
    if (error) {
      throw error
    } else {
      return result
    }
  }

  async update(context, options = {}) {
    const {
      criteria,
      payload,
      incPayload = {},
      returnDocument = 'after',
      upsert = false,
      isSetUpdate = true,
      multi = false
    } = {
      ...options
    }
    const _payload = _.cloneDeep(payload)
    const _incPayload = _.cloneDeep(incPayload)
    if (upsert === true) {
      // add id (uuid)
      _payload.id = _payload.id || uuidv4()
      _payload.createdAt = new Date()
    }

    // Add timestamps
    _payload.updatedAt = new Date()
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)

    const updatePayload = Object.keys(_incPayload).length === 0 ? {
      $set: _payload
    } : {
      $set: _payload,
      $inc: _incPayload
    }
    const [error, result] = await to(collection
      .findOneAndUpdate(
        convertObjectId(criteria),
        isSetUpdate ? updatePayload : _payload, {
          returnDocument,
          upsert,
          multi
        }
      ))
    if (error) {
      throw error
    } else {
      return result
    }
  }

  async upsert(context, options = {}) {
    // call update with upsert set to true
    options.upsert = true
    options.returnDocument = 'after'
    return this.update(context, options)
  }

  findByIdAndUpdate(context, options = {}) {
    const {
      id,
      payload,
      incPayload = {},
      returnOriginal = false,
      upsert = false,
      isSetUpdate = true
    } = {
      ...options
    }
    const _options = {
      criteria: {
        id
      },
      payload,
      incPayload,
      returnOriginal,
      upsert,
      isSetUpdate
    }
    return this.update(context, _options)
  }

  async remove(context, options = {}) {
    const {
      criteria
    } = {
      ...options
    }
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
    const [error, result] = await to(collection.findOneAndDelete(convertObjectId(criteria)))
    if (error) {
      throw error
    } else {
      return result
    }
  }

  async removeMultiple(context, options = {}) {
    const {
      criteria
    } = {
      ...options
    }
    try {
      const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
      const [error, result] = await to(collection.deleteMany(convertObjectId(criteria)))
      if (error) {
        throw error
      } else {
        return result
      }
    } finally {
      // this.connectionManager.release(mongo)
    }
  }

  findByIdAndRemove(context, options = {}) {
    const {
      id
    } = {
      ...options
    }
    const _options = {
      criteria: {
        id
      }
    }
    return this.remove(context, _options)
  }

  removeByCriteria(context, options = {}) {
    return this.removeMultiple(context, options)
  }

  async updateByCriteria(context, options = {}) {
    const {
      criteria,
      payload,
      incPayload = {},
      multi = false,
      upsert = false
    } = {
      ...options
    }
    const _payload = _.cloneDeep(payload)
    const _incPayload = _.cloneDeep(incPayload)
    // Add timestamps
    _payload.updatedAt = new Date()
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)

    const updatePayload = Object.keys(_incPayload).length === 0 ? {
      $set: _payload
    } : {
      $set: _payload,
      $inc: _incPayload
    }

    const [error, result] = await to(collection
      .update(
        convertObjectId(criteria),
        updatePayload, {
          multi,
          upsert
        }
      ))
    if (error) {
      throw error
    } else {
      return result
    }
  }

  async findAndUpdate(context, options = {}) {
    const {
      criteria,
      payload,
      incPayload = {},
      multi = false,
      upsert = false
    } = {
      ...options
    }
    return this.updateByCriteria({
      criteria,
      payload,
      incPayload,
      multi,
      upsert
    })
  }

  async aggregate(context, options = {}) {
    const {
      pipeline
    } = {
      ...options
    }
    const collection = this.connectionManager.getCollection(context) // mongo.db(context.tenant).collection(context.coll)
    const [error, result] = await to(collection.aggregate(pipeline).toArray())
    if (error) {
      throw error
    } else {
      return result
    }
  }
}

module.exports = Database