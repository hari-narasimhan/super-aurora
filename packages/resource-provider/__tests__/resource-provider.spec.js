'use strict';

const ResourceProvider = require('../lib')

test('@super-aurora/resource-provider::Should throw error if invalid resource type is added', () => {
  const rp = new ResourceProvider()
  const t = () => {
    rp.add({name: 'db', type: 'unknown-provider', config: {} })
  }
  expect(t).toThrow(Error)
})