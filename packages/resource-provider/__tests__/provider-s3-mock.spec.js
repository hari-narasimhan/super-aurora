'use strict'
const fs = require('fs')
const ResourceProvider = require('../lib');
const rp = new ResourceProvider()


beforeAll(async () => {
  await rp.add({type: 's3-mock', name: 's3', config: {basePath: '/tmp/buckets'}})
})

afterAll(async () => {
  // IMPORTANT
  // below line is required to avoid jest open handle error
   await new Promise(resolve => setTimeout(() => resolve(), 500))
  console.log('E2E completed, closed the server')
})


test('@super-phoenix/provider-S3-MOCK::Should upload a document', async () => {
  const s3 = rp.get('s3')
  // const result = await 
  const result = await s3.upload({Bucket: 'test-bucket', Key: 'test.json', Body: fs.createReadStream(__dirname + '/files/test.json')})
  console.log(result)
  expect(result).toBeTruthy()
})


test('@super-phoenix/provider-S3-MOCK::Should fetch a document', async () => {
  const s3 = rp.get('s3')
  // const result = await 
  const result = await s3.getObject({Bucket: 'test-bucket', Key: 'test.json'})
  console.log(result)
  expect(result).toBeTruthy()
})

test('@super-phoenix/provider-S3-MOCK::Should create a folder', async () => {
  const s3 = rp.get('s3')
  // const result = await 
  const result = await s3.createFolder({Bucket: 'test-bucket', Key: 'my-folder'})
  console.log(result)
  expect(result).toBeTruthy()
})

jest.setTimeout(100000)