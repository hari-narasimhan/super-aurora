'use strict';
const S3 = require('./s3')
exports.create = async (config) => {
  return new S3(config)
}