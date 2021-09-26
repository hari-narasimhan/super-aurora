'use strict';
const to = require('await-to-js').default
const ResourceProvider = require('../lib')

test('@super-aurora/resource-provider::Should throw error if invalid resource type is added', async () => {
  const rp = new ResourceProvider()
  const [t] = await to(rp.add({name: 'db', type: 'unknown-provider', config: {} }))

  expect(t).toBeTruthy()
})