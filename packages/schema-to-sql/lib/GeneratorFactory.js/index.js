'use strict'
const pg = require('./pg')
const redshift = require('./redshift')
const { SCHEMA_OPERATIONS } = require('./constants')

function generateSchema(target, schema) {
  switch (target) {
    case 'pg':
      return pg.generateSchema(schema)
    case 'redshift':
      return redshift.generateSchema(schema)
    default:
      throw new Error('Unknown Schema, aborting DDL generation!')
  }
}

function generateSchemaFromDiffOps(target, ops) {
  switch (target) {
    case 'pg':
      return pg.generateSchemaFromDiffOps(ops)
    case 'redshift':
      return redshift.generateSchemaFromDiffOps(ops)
    default:
      throw new Error('Unknown Schema, aborting DDL generation!')
  }
}

module.exports = {
  generateSchema,
  generateSchemaFromDiffOps,
  SCHEMA_OPERATIONS
}