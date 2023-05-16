'use strict'

class ApplicationError extends Error {
  constructor (code, message, statusCode = 422) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

const createAppError = ({ code, message, statusCode }) => {
  return new ApplicationError(code, message, statusCode)
}

module.exports = ApplicationError
module.exports.createAppError = createAppError
