'use strict'
const ResourceProvider = require('../lib');
const rp = new ResourceProvider()
const _ = require('lodash')
const to = require('await-to-js').default

const config = {
  mongo: {dbName: 'testProviders'}
}

config.env = 'test'
config.mongo.uri = process.env.MONGODB_URI || `mongodb://localhost:27017/${config.mongo.dbName}`

const mongoConfig = {
  uri: config.mongo.uri,
  maxPoolSize: 5,
  minPoolSize: 1,
  connectTimeoutMS: 30000,
}

beforeAll(async () => {
  await rp.add({type: 'mongo', name: 'db', config: mongoConfig})
})

afterAll(async () => {
  // IMPORTANT
  // below line is required to avoid jest open handle error
  const db = rp.get('db')
  db.close()
  await new Promise(resolve => setTimeout(() => resolve(), 500))
  console.log('E2E completed, closed the server')
})

const ctxProviders = { db: 'providerMongoTest', coll: 'providers' }
const ctxDepartments = { db: 'providerMongoTest', coll: 'departments' }

test('@super-phoenix/provider-mongo::Cleanup previous run', async () => {
  const db = rp.get('db')
  let result = await db.removeMultiple(ctxProviders, { criteria: {} })
  result = await db.removeMultiple(ctxDepartments, { criteria: {} })
  expect(result).toBeTruthy()
})

test('@super-phoenix/provider-mongo::Should insert a document into the database', async () => {
  const payload = { name: 'mongo', config: {} }
  const db = rp.get('db')
  const result = await db.insert(ctxProviders, {  payload })
  const id = result._id
  const inserted = await db.findOne(ctxProviders, { query: { _id: id } })
  expect(inserted.id).toEqual(payload.id)
  return true
})

test('@super-phoenix/provider-mongo::Should find one', async () => {
  const query = { name: 'mongo' }
  const db = rp.get('db')
  const result = await db.findOne(ctxProviders, {  query })
  expect(result.name).toEqual(query.name)
})

test('@super-phoenix/provider-mongo::Should find by params', async () => {
  const query = { name: 'mongo' }
  const db = rp.get('db')
  const result = await db.findByParams(ctxProviders, {  query })
  expect(result.name).toEqual(query.name)
})

test('@super-phoenix/provider-mongo::Should upsert', async () => {
  const criteria = { name: 'mongo-upserted' }
  const db = rp.get('db')
  const result = await db.upsert(ctxProviders, {  criteria, payload: criteria, multi: false })
  expect(result.ok).toBe(1)
  expect(result.value.name).toEqual(criteria.name)
  expect(result.value._id).toBeTruthy()
  expect(result.value.id).toBeTruthy()
})

test('@super-phoenix/provider-mongo::Should remove', async () => {
  const criteria = { name: 'mongo-upserted' }
  const db = rp.get('db')
  const result = await db.remove(ctxProviders, {  criteria })
  expect(result.value.name).toEqual(criteria.name)
  expect(result.value.id).toBeTruthy()
})

test('@super-phoenix/provider-mongo::Should find by id and remove', async () => {
  const criteria = { name: 'mongo-upserted-removed' }
  const db = rp.get('db')
  const result = await db.upsert(ctxProviders, {  criteria, payload: criteria, returnNewDocument: true, returnDocument: 'after' })
  expect(result.ok).toBe(1)
  expect(result.value.name).toEqual(criteria.name)
  expect(result.value.id).toBeTruthy()
  const removeByIdResult = await db.findByIdAndRemove(ctxProviders, {  id: result.value.id })
  expect(removeByIdResult.value.name).toEqual(result.value.name)
  expect(removeByIdResult.value.id).toEqual(result.value.id)
})

test('@super-phoenix/provider-mongo::Should find without cursor', async () => {
  const query = { name: 'mongo' }
  const db = rp.get('db')
  const result = await db.find(ctxProviders, {  query })
  expect(result.cursor).toBeFalsy()
})

test('@super-phoenix/provider-mongo::Should find with cursor', async () => {
  const query = { name: 'mongo' }
  const db = rp.get('db')
  const result = await db.find(ctxProviders, {  query, includeCursor: true })
  expect(result.cursor.totalRecords).toBeGreaterThanOrEqual(1)
})

test('@super-phoenix/provider-mongo::Should find by id and update', async () => {
  const criteria = { name: 'mongo' }
  const db = rp.get('db')
  const result = await db.findOne(ctxProviders, {  criteria })
  // console.log(result, inserted)
  const updateCriteria = { name: 'new mongo' }
  await db.findByIdAndUpdate(ctxProviders, {  id: result.id, payload: updateCriteria })
  const updatedResult = await db.findOne(ctxProviders, {  criteria: updateCriteria })
  expect(updatedResult.name).toEqual(updateCriteria.name)
})

test('@super-phoenix/provider-mongo::Should aggregate', async () => {
  const db = rp.get('db')
  await db.insert(ctxDepartments, { payload: { name: 'mathematics', category: 'students', count: 10 } })
  await db.insert(ctxDepartments, { payload: { name: 'physics', category: 'students', count: 20 } })
  await db.insert(ctxDepartments, { payload: { name: 'history', category: 'students', count: 100 } })
  await db.insert(ctxDepartments, { payload: { name: 'engineering', category: 'students', count: 50 } })
  await db.insert(ctxDepartments, { payload: { name: 'engineering', category: 'tutors', count: 5 } })
  const pipeline = [
    { $match: {} },
    {
      $group: {
        _id: { category: '$category' },
        total: { $sum: '$count' }
      }
    }
  ]
  const result = await db.aggregate(ctxDepartments, { pipeline })
  expect(result.length).toEqual(2)
})

// test('@super-phoenix/provider-mongo::Should find as stream', async () => {
//   const db = rp.get('db')
//   const result = await db.findAsStream(ctxDepartments)
//   expect(isStream(result)).toEqual(true)
// })

test('@super-phoenix/provider-mongo::Should return count', async () => {
  const db = rp.get('db')
  const result = await db.count(ctxDepartments)
  expect(result.count).toEqual(5)
})

test('@super-phoenix/provider-mongo::Should insert multiple records', async () => {
  const db = rp.get('db')
  const result = await db.insertMany(
    ctxDepartments,
    {payload: [
      { name: 'Advanced mathematics', category: 'students', count: 10 },
      { name: 'Astro-physics', category: 'students', count: 10 }
    ]
  })
  const find1 = await db.find(ctxDepartments, { query: { _id: { $in: _.values(result.insertedIds) } }, includeCursor: true })
  expect(find1.cursor.totalRecords).toEqual(2)
  const find2 = await db.find(ctxDepartments, { query: { _id: result.insertedIds[0].toString() }, includeCursor: true })
  expect(find2.cursor.totalRecords).toEqual(1)
  expect(find2.records[0]._id.toString()).toEqual(result.insertedIds[0].toString())
})

test('@super-phoenix/provider-mongo::Should throw error if insert many payload is not an array', async () => {
  const db = rp.get('db')
  const [err, result] = await to(db.insertMany(
    ctxDepartments,
    {
    payload: { name: 'advanced mathematics', category: 'students', count: 10 }
  }
  ))
  expect(err).toBeTruthy()
  expect(result).toBeFalsy()
})

test('@super-phoenix/provider-mongo::Should throw error if insert payload is an array', async () => {
  const db = rp.get('db')

  const [err, result] = await to(db.insert(ctxDepartments,
    {payload: [{ name: 'advanced mathematics', category: 'students', count: 10 }]
  }
  ))
  expect(err).toBeTruthy()
  expect(result).toBeFalsy()
})

test('@super-phoenix/provider-mongo::Should access ObjectId', async () => {
  const db = rp.get('db')
  const ObjectId = db.ObjectId
  const oid = new ObjectId()
  expect(ObjectId.isValid(oid)).toEqual(true)
})

test('@super-phoenix/provider-mongo::Should find with projections', async () => {
  const db = rp.get('db')
  const find1 = await db.find(ctxDepartments, { query: {}, projection: { name: 1 }, includeCursor: true })
  expect(find1.cursor.totalRecords).toBeGreaterThanOrEqual(2)
  expect(find1.records[0].category).toBeFalsy()
  expect(find1.records[0].id).toBeTruthy()
})

test('@super-phoenix/provider-mongo::Should find one with projections', async () => {
  const db = rp.get('db')
  const department = await db.findOne(ctxDepartments, { query: { name: 'Astro-physics' }, projection: { name: 1 } })
  expect(department.category).toBeFalsy()
})

jest.setTimeout(100000)