'use strict';
const ConnectionManager = require('./connection-manager')
const Database = require('./db')
exports.create = async (config) => {
  const cm = new ConnectionManager()
  await cm.init(config)
  return new Database(cm)
}