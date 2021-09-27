'use strict'

class ApplicationError extends Error {
  constructor (message, statusCode = 422) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ApplicationError
