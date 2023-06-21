const { SCHEMA_OPERATIONS } = require('./constants')

function generateUniqueConstraints(attributes) {
  const uniqueCols = attributes.filter((attribute) => attribute.name !== 'id' && attribute.isUnique).map((a) => a.name)
  if (uniqueCols.length > 0) {
    return `  UNIQUE(${uniqueCols.join(',')})`
  }
  return null
}

function getColumnType(attribute) {
  let type = ''
  switch (attribute.type) {
    case 'auto-generated':
      type = 'VARCHAR(255)'
      break;
    case 'boolean':
      type = 'BOOLEAN'
      break;
    case 'computed':
      type = 'VARCHAR(255)'
      break;
    case 'currency':
      type = 'MONEY'
      break;
    case 'date':
      type = 'DATE'
      break;
    case 'datetime':
      type = 'TIMESTAMP'
      break;
    case 'document':
      type = 'JSON'
      break;
    case 'integer':
      type = 'INTEGER'
      break;
    case 'list':
      type = 'JSON'
      break;
    case 'location':
      type = 'POINT'
      break;
    case 'number':
      type = `DECIMAL`
      break;
    case 'string':
      type = `VARCHAR(${attribute.max || '255'})`
      break;
    case 'text':
      type = 'TEXT'
      break;
    case 'timestamp':
      type = 'TIMESTAMP'
      break;
    case 'reference':
      type = 'JSON'
      break;
    default:
      throw new Error(`Invalid attribute type ${attribute.type}`)
  }
  return type
}

function getDefaultValue(attribute) {
  let defaultValue
  switch (attribute.type) {
    case 'auto-generated':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'boolean':
      defaultValue = attribute.defaultValue || null
      break;
    case 'computed':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'currency':
      defaultValue = attribute.defaultValue || null
      break;
    case 'date':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'datetime':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'integer':
      defaultValue = attribute.defaultValue || null
      break;
    case 'number':
      defaultValue = attribute.defaultValue || null
      break;
    case 'string':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'text':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'timestamp':
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    default:
      throw new Error(`Invalid attribute type ${attribute.type}`)
  }
  return defaultValue
}

function generateColumn(attribute, addComma) {
  const type = getColumnType(attribute)
  let defaultValue = getDefaultValue(attribute)

  if (defaultValue) {
    defaultValue = `DEFAULT ${defaultValue} `
  }
  return `  ${attribute.name} ${type} ${attribute.name === 'id' ? 'PRIMARY KEY' : ''} ${attribute.isRequired ? 'NOT NULL' : ''}${addComma ? ',' : ''} `
}

function generateModel(model) {
  const generated = []
  const unique = generateUniqueConstraints(model.attributes)
  generated.push(`CREATE TABLE IF NOT EXISTS ${model.name} (`)
  model.attributes.forEach((attribute, index) => {
    let addComma = true
    if (unique === null && index === model.attribute.length - 1) {
      addComma = false
    }
    generated.push(generateColumn(attribute, addComma))
  })
  if (unique) {
    generated.push(generateUniqueConstraints(model.attributes))
  }
  generated.push(');\n')
  return generated.join('\n')
}

function generateSchema(schema) {
  const { models } = schema
  const generated = []
  models.forEach((model) => {
    generated.push(generateModel(model))
  })
  return generated.join('\n')
}

function generateAlterTable(op) {
  return `ALTER TABLE ${op.params.previous.name} RENAME TO ${op.params.current.name};`
}

function generateDropModel(name) {
  return `DROP TABLE ${name} IF EXISTS;`
}

function generateDropAttribute(op) {
  return `ALTER TABLE ${op.params.model.name} DROP COLUMN ${op.params.attribute.name};`;
}

function generateModifyAttribute(op) {
  const attribute = op.params.attribute
  return `ALTER TABLE ${op.params.model.name}
      ALTER COLUMN ${attribute.name} TYPE ${getColumnType(attribute)};\n`
}

function generateChangeAttributeName(op) {
  return `ALTER TABLE ${op.params.model.name}\nRENAME COLUMN ${op.params.previous.name} TO ${op.params.current.name};\n`
}

function generateAddAttribute(op) {
  return `ALTER TABLE ${op.params.model.name}\nADD COLUMN ${generateColumn(op.params.attribute, false)};\n`
}

function generateAttributeNullConstraint(op) {
  return `ALTER TABLE ${op.params.model.name}\nALTER COLUMN ${op.params.attribute.name} ${op.params.attribute.isRequired ? 'SET NOT NULL' : 'DROP NOT NULL'};`
}
function generateSchemaFromDiffOps(ops) {
  const generated = []
  for (const op of ops) {
    switch (op.type) {
      case SCHEMA_OPERATIONS.DROP_MODEL:
        generated.push(generateDropModel(op.params.name))
        break;
      case SCHEMA_OPERATIONS.ADD_MODEL:
        generated.push(generateModel(op.params.model))
        break;
      case SCHEMA_OPERATIONS.CHANGE_MODEL_NAME:
        generated.push(generateAlterTable(op))
        break;
      case SCHEMA_OPERATIONS.CHANGE_ATTRIBUTE_NAME:
        generated.push(generateChangeAttributeName(op));
        break;
      case SCHEMA_OPERATIONS.CHANGE_ATTRIBUTE_IS_NULL:
        generated.push(generateAttributeNullConstraint(op))
        break;
      case SCHEMA_OPERATIONS.ADD_ATTRIBUTE:
        generated.push(generateAddAttribute(op))
        break;
      case SCHEMA_OPERATIONS.DROP_ATTRIBUTE:
        generated.push(generateDropAttribute(op))
        break;
      case SCHEMA_OPERATIONS.MODIFY_ATTRIBUTE:
        generated.push(generateModifyAttribute(op))
        break;
    }
  }
  return generated.join('\n')
}

module.exports = {
  generateSchema,
  generateSchemaFromDiffOps
}