const { SCHEMA_OPERATIONS } = require('./constants')

function generateUniqueConstraints(attributes) {
  const uniqueCols = attributes.filter((attribute) => attribute.name !== 'id' && attribute.isUnique).map((a) => a.name)
  if (uniqueCols.length > 0) {
    return `  UNIQUE(${uniqueCols.join(',')})`
  }
  return null
}

function generateColumn(attribute, addComma) {
  let type = ''
  let defaultValue
  switch (attribute.type) {
    case 'auto-generated':
      type = 'VARCHAR(255)'
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'boolean':
      type = 'BOOLEAN'
      defaultValue = attribute.defaultValue || null
      break;
    case 'computed':
      type = 'VARCHAR(255)'
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'currency':
      type = 'MONEY'
      defaultValue = attribute.defaultValue || null
      break;
    case 'date':
      type = 'DATE'
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'datetime':
      type = 'TIMESTAMP'
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'document':
      type = 'SUPER'
      break;
    case 'integer':
      type = 'INTEGER'
      defaultValue = attribute.defaultValue || null
      break;
    case 'list':
      type = 'SUPER'
      break;
    case 'location':
      type = 'GEOMETRY'
      break;
    case 'number':
      type = `DECIMAL`
      defaultValue = attribute.defaultValue || null
      break;
    case 'string':
      type = `VARCHAR(${attribute.max || '255'})`
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'text':
      type = 'TEXT'
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'timestamp':
      type = 'TIMESTAMPTZ'
      defaultValue = `'${attribute.defaultValue}'` || null
      break;
    case 'reference':
      type = 'SUPER'
      break;
    default:
      throw new Error(`Invalid attribute type ${attribute.type
        }`)
  }
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
  return `ALTER TABLE ${op.params.model.name}\nALTER COLUMN ${generateColumn(op.params.attribute, false)};\n`
}

function generateChangeAttributeName(op) {
  return `ALTER TABLE ${op.params.model.name}\nRENAME COLUMN ${op.params.previous.name} TO ${op.params.current.name};\n`
}

function generateAddAttribute(op) {
  return `ALTER TABLE ${op.params.model.name}\nADD COLUMN ${generateColumn(op.params.attribute, false)};\n`
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