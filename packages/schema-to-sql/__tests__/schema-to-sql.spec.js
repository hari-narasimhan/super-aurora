'use strict';

const schemaToSql = require('../lib');

const current = require('./inputs/current.json')
const changeSet1 = require('./inputs/change-set1.json')

describe('generate schema', () => {
  it('Should generate schema only with current', () => {
    const targets = ['pg', 'redshift']
    const result = schemaToSql.generateDDL(targets, current)
    expect(result).toBeTruthy()
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    // targets.forEach(t => console.log(result[t]))
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
  it('should generate alter statements when columns are added', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/add-column-after.json')
    const current = require('./inputs/add-column-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(result)
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE users\nADD COLUMN   address TEXT  ;\n')
    expect(result.redshift).toEqual('ALTER TABLE users\nADD COLUMN   address TEXT  ;\n')

    // targets.forEach(t => console.log(result[t]))
  })

  // Columns removed
  it('should generate alter statements when columns are removed', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/remove-column-after.json')
    const current = require('./inputs/remove-column-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(result)
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE users DROP COLUMN weddingDate;')
    expect(result.redshift).toEqual('ALTER TABLE users DROP COLUMN weddingDate;')

    // targets.forEach(t => console.log(result[t]))
  })
  // Columns renamed
  it('should generate alter statements when columns are renamed', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/rename-column-after.json')
    const current = require('./inputs/rename-column-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(result)
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE users\nRENAME COLUMN weddingDate TO marriageDate;\n')
    expect(result.redshift).toEqual('ALTER TABLE users\nRENAME COLUMN weddingDate TO marriageDate;\n')

    // targets.forEach(t => console.log(result[t]))
  })

  // Column data type changed
  // Table added
  // Table removed
  // Table renamed
  // Unique constraints added
  // Unique constraints removed
  // Unique constraints column added
  // Unique constraints column removed

  // General, catch all
  it('Should generate schema when a schema is modified', () => {
    const targets = ['pg', 'redshift']
    const result = schemaToSql.generateDDL(targets, changeSet1, current)
    expect(result).toBeTruthy()
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
  })


  // Change model name and attributes in same operation
})