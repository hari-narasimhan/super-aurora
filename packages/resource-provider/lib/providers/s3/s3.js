const AWS = require('aws-sdk')

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

const getObject = (params) => {
  return s3.getObject(params).promise()
}

const headObject = (params) => {
  return s3.headObject(params).promise()
}

const putObject = (params) => {
  return s3.putObject(params).promise()
}

const getObjectAsStream = (params) => {
  return s3.getObject(params).createReadStream()
}

const upload = (params) => {
  return s3.upload(params).promise()
}

const listBuckets = () => {
  return s3.listBuckets().promise()
}

const list = (params) => {
  return s3.listObjectsV2(params).promise()
}

const remove = (params) => {
  return s3.deleteObject(params).promise()
}

const removeMultiple = (params) => {
  return s3.deleteObjects(params).promise()
}

module.exports = {
  headObject,
  getObject,
  getObjectAsStream,
  putObject,
  list,
  listBuckets,
  remove,
  removeMultiple,
  upload
}
