'use strict'
const ResourceProvider = require('../lib');
const rp = new ResourceProvider()


beforeAll(async () => {
  await rp.add({type: 's3', name: 's3', config: {region: 'us-east-1'}})
})

afterAll(async () => {
  // IMPORTANT
  // below line is required to avoid jest open handle error
   await new Promise(resolve => setTimeout(() => resolve(), 500))
  console.log('E2E completed, closed the server')
})


test('@super-phoenix/provider-S3::should get s3 from provider', async () => {
  const s3 = rp.get('s3')
  expect(s3).toBeTruthy()
})

jest.setTimeout(100000)