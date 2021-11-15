'use strict'
const AWS = require('aws-sdk')

exports.init = (options) => {
  if(options.region) {
    AWS.config.update({ region: options.region })
  }
}
