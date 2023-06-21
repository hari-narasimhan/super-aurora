'use strict';

const schemaToSql = require('../lib');

const current = require('./inputs/current.json')
const changeSet1 = require('./inputs/change-set1.json')

describe('generate schema', () => {
  it('Should generate schema only with current', () => {
    const targets = ['pg', 'redshift']
    const result = schemaToSql.generateDDL(targets, current)
    // console.log(result)
    expect(result).toBeTruthy()
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    targets.forEach(t => console.log(result[t]))
  })

  it('should throw error if unsupported target is specified', () => {
    const t = () => {
      const targets = ['pg1']
      schemaToSql.generateDDL(targets, current)
    }
    expect(t).toThrow(Error)
  })
})

describe('generate schema from diff', () => {

  // Columns added
  it('Should generate schema when a column is added', () => {
    const targets = ['pg', 'redshift']
    const result = schemaToSql.generateDDL(targets, changeSet1, current)
    expect(result).toBeTruthy()
    // console.log(JSON.stringify(result))
    targets.forEach(t => console.log(result[t]))
    // expect(result).toBeTruthy()
    // expect(typeof result).toEqual('object')
    // expect(Object.keys(result)).toEqual(targets)
    // targets.forEach(t => console.log(result[t]))
  })

  // Columns removed
  // Columns renamed
  // Column data type changed
  // Table added
  // Table removed
  // Table renamed
  // Unique constraints added
  // Unique constraints removed
  // Unique constraints column added
  // Unique constraints column removed

  // Change model name and attributes in same operation
})