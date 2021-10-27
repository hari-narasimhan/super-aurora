'use strict'
const AWSMock = require('mock-aws-s3')

class S3Mock {
  constructor (options) {
    if (options.basePath) {
      AWSMock.config.basePath =  options.basePath
    }
    this._s3 = AWSMock.S3()
  }

  upload (params, options) {
    return this._s3.upload(params,options).promise()
  }

  getObject (params) {
    return this._s3.getObject(params).promise()
  }

  createFolder (params) {
    const _params = {
      Bucket: params.Bucket,
      Key: `${params.Key}/readme.txt`,
      Body: `folder: ${params.Key}`
    }
    return this._s3.putObject(_params).promise()
  }

}

module.exports = S3Mock
