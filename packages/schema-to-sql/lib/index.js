'use strict';

const { generateSchema, generateSchemaFromDiffOps, SCHEMA_OPERATIONS } = require('./GeneratorFactory')
const { hasUniqueColumnsChanged } = require('./GeneratorFactory/util')

function generateDiffOperations(current, previous) {
  // Check for dropped models
  const ops = []
  const droppedModels = previous.models.filter(m => current.models.findIndex(c => c.id === m.id) == -1)

  if (droppedModels.length > 0) {
    droppedModels.forEach(dm => {
      ops.push({ type: SCHEMA_OPERATIONS.MODEL_DROPPED, params: { name: dm.name } })
    })
  }

  for (const model of current.models) {
    const prevModel = previous.models.find(p => p.id === model.id)
    if (!prevModel) {
      ops.push({ type: SCHEMA_OPERATIONS.MODEL_ADDED, params: { model } })
    } else {
      if (model.name !== prevModel.name) {
        ops.push({ type: SCHEMA_OPERATIONS.MODEL_NAME_CHANGED, params: { current: model, previous: prevModel } })
      }

      // Check for changed attributes
      const droppedAttributes = prevModel.attributes.filter(attr => model.attributes.findIndex(a => a.id === attr.id) == -1)
      if (droppedAttributes.length > 0) {
        droppedAttributes.forEach(da => {
          ops.push({
            type: SCHEMA_OPERATIONS.ATTRIBUTE_DROPPED, params: { model: { id: model.id, name: model.name }, attribute: { id: da.id, name: da.name } }
          })
        })
      }
      for (const attribute of model.attributes) {
        const attr = prevModel.attributes.find(a => a.id === attribute.id)
        if (!attr) {
          ops.push({
            type: SCHEMA_OPERATIONS.ATTRIBUTE_ADDED,
            params: { model: { id: model.id, name: model.name }, attribute }
          })
        } else {
          // Check for name change
          if (attr.name !== attribute.name) {
            ops.push({
              type: SCHEMA_OPERATIONS.ATTRIBUTE_NAME_CHANGED,
              params: { model: { id: model.id, name: model.name }, current: attribute, previous: attr }
            })
          }
          // Check if null constraint is changed
          if (attr.isRequired !== attribute.isRequired) {
            ops.push({
              type: SCHEMA_OPERATIONS.ATTRIBUTE_IS_NULL_CHANGED,
              params: { model: { id: model.id, name: model.name }, attribute }
            })
          }
          // Check if type has been changed
          if (
            attr.type !== attribute.type
            || attr.min !== attribute.min
            || attr.max !== attribute.max) {
            ops.push({
              type: SCHEMA_OPERATIONS.ATTRIBUTE_MODIFIED,
              params: { model: { id: model.id, name: model.name }, attribute }
            })
          }
        }
      }
      // Check if unique constraints have changed
      if (hasUniqueColumnsChanged(prevModel, model)) {
        ops.push({
          type: SCHEMA_OPERATIONS.UNIQUE_CONSTRAINTS_CHANGED,
          params: { model }
        })
      }
    }
  }
  return ops
}


/**
 * Generates DDL based on the difference between the schemas for all targets
 * @param {*} targets 
 * @param {*} current 
 * @param {*} previous 
 */
function generateFromDiffOps(targets, current, previous) {
  if (targets?.length === 0) {
    throw new Error('Targets must be an array with minimum of one target')
  }
  const ops = generateDiffOperations(current, previous)
  const result = targets.reduce((sql, currentTarget) => {
    sql[currentTarget] = generateSchemaFromDiffOps(currentTarget, ops)
    return sql
  }, {})
  return result
}

/**
 * Generate DDL from schema based onthe rarget supplied
 * @param {*} targets 
 * @param {*} schema
 * @returns Array 
 */
function generateFromSchema(targets, schema) {
  if (targets?.length === 0) {
    throw new Error('Targets must be an array with minimum of one target')
  }

  const result = targets.reduce((sql, currentTarget) => {
    sql[currentTarget] = generateSchema(currentTarget, schema)
    return sql
  }, {})

  return result
}

/**
 * Generates DDL from schema, If previous and current schemas are provided, the diff is generated, if previous is omitted, DDL
 * for entire current is generated
 * @param {Object} previous 
 * @param {Object} current 
 * @param {Array} targets 
 * @returns Array
 */
function generateDDL(targets, current, previous) {
  if (!previous) {
    return generateFromSchema(targets, current)
  }
  return generateFromDiffOps(targets, current, previous)
}

module.exports = {
  generateDDL
}