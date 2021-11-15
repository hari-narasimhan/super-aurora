'use strict'
const cm = require('./connection-manager')
const s3 = require('./s3')

exports.create = (config) => {
  cm.init(config)
  return s3
}
