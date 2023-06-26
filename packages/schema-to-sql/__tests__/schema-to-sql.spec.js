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

  it('should throw error if unsupported target is specified', () => {
    const t = () => {
      const targets = ['pg1']
      schemaToSql.generateDDL(targets, changeSet1, current)
    }
    expect(t).toThrow(Error)
  })

  // Columns added
  it('should generate alter statements when columns are added', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/add-column-after.json')
    const current = require('./inputs/add-column-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    console.log(result)
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE "users"\nADD COLUMN   "address" TEXT  ;\n')
    expect(result.redshift).toEqual('ALTER TABLE "users"\nADD COLUMN   "address" TEXT  ;\n')

    targets.forEach(t => console.log(result[t]))
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
    expect(result.pg).toEqual('ALTER TABLE "users" DROP COLUMN "weddingDate";')
    expect(result.redshift).toEqual('ALTER TABLE "users" DROP COLUMN "weddingDate";')

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
    expect(result.pg).toEqual('ALTER TABLE "users"\nRENAME COLUMN "weddingDate" TO "marriageDate";\n')
    expect(result.redshift).toEqual('ALTER TABLE "users"\nRENAME COLUMN "weddingDate" TO "marriageDate";\n')

    // targets.forEach(t => console.log(result[t]))
  })

  // Column data type changed
  it('should generate alter statements when columns types are changed', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/change-column-datatype-after.json')
    const current = require('./inputs/change-column-datatype-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(result)
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE "users"\nALTER COLUMN "dateOfBirth" TYPE TIMESTAMP;\n')
    expect(result.redshift).toEqual('ALTER TABLE "users"\nALTER COLUMN "dateOfBirth" TYPE TIMESTAMPTZ;\n')

    // targets.forEach(t => console.log(result[t]))
  })

  // Table added
  it('should generate alter statements when tables are added', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/add-table-after.json')
    const current = require('./inputs/add-table-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(JSON.stringify(result))
    expect(typeof result).toEqual('object')
    const expected = require('./inputs/add-table-expected.json')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual(expected.pg)
    expect(result.redshift).toEqual(expected.redshift)

    // targets.forEach(t => console.log(result[t]))
  })

  // Table removed
  it('should generate alter statements when tables are removed', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/remove-table-after.json')
    const current = require('./inputs/remove-table-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(JSON.stringify(result))
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('DROP TABLE IF EXISTS "projects";')
    expect(result.redshift).toEqual('DROP TABLE IF EXISTS "projects";')

    // targets.forEach(t => console.log(result[t]))
  })

  // Table renamed
  it('should generate alter statements when tables are renamed', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/rename-table-after.json')
    const current = require('./inputs/rename-table-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(JSON.stringify(result))
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE "projects" RENAME TO "projectsDetails";')
    expect(result.redshift).toEqual('ALTER TABLE "projects" RENAME TO "projectsDetails";')

    // targets.forEach(t => console.log(result[t]))
  })

  // Is required added
  it('should generate alter statements when is required set to true', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/add-mandatory-table-after.json')
    const current = require('./inputs/add-mandatory-table-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(JSON.stringify(result))
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual('ALTER TABLE "users"\nALTER COLUMN "email" SET NOT NULL;')
    expect(result.redshift).toEqual('ALTER TABLE "users"\nALTER COLUMN "email" SET NOT NULL;')

    // targets.forEach(t => console.log(result[t]))
  })

  // Unique constraints added
  it('should generate alter statements when unique constraints are added', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/add-unique-constraint-table-after.json')
    const current = require('./inputs/add-unique-constraint-table-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(JSON.stringify(result))
    const expected = require('./inputs/add-unique-constraint-table-expected.json')

    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual(expected.pg)
    expect(result.redshift).toEqual(expected.redshift)

    // targets.forEach(t => console.log(result[t]))
  })

  // Unique constraints are removed
  it('should generate alter statements when unique constraints are removed', () => {
    const targets = ['pg', 'redshift']
    const changeset = require('./inputs/remove-unique-constraint-table-after.json')
    const current = require('./inputs/remove-unique-constraint-table-before.json')
    const result = schemaToSql.generateDDL(targets, changeset, current)
    // console.log(JSON.stringify(result))
    const expected = require('./inputs/remove-unique-constraint-table-expected.json')

    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
    expect(result.pg).toEqual(expected.pg)
    expect(result.redshift).toEqual(expected.redshift)

    // targets.forEach(t => console.log(result[t]))
  })

  // Change model name and attributes in same operation
  // General, catch all
  it('Should generate schema when a schema is modified', () => {
    const targets = ['pg', 'redshift']
    const result = schemaToSql.generateDDL(targets, changeSet1, current)
    targets.forEach(t => console.log(result[t]))
    expect(result).toBeTruthy()
    expect(typeof result).toEqual('object')
    expect(Object.keys(result)).toEqual(targets)
  })
})