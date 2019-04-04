'use strict'

const { validationResult } = require('express-validator/check')
const msgFactory = require('../helpers/msgFactory')

/**
 * General error handler middleware for internal api
 */
module.exports.errorHandler = (err, req, res, next) => {
  if (err) {
    console.log(err.stack)
    if (res.status === 400) { // status assigned by body-parser when encounter parsing error
      msgFactory.expressCreateResponseMessage(
        res,
        msgFactory.messageTypes.MSG_ERROR_BAD_REQUEST
      )
    } else {
      msgFactory.expressCreateResponseMessage(
        res,
        msgFactory.messageTypes.MSG_ERROR
      )
    }
  }
}

/**
 * Not found handler middleware, place before errorHandler
 */
module.exports.notFoundErrorHandler = (req, res, next) => {
  msgFactory.expressCreateResponseMessage(
    res,
    msgFactory.messageTypes.MSG_ERROR_NOT_FOUND
  )
}

/**
 * Handle validator error
 */
module.exports.validatorErrorHandler = (req, res, next) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    msgFactory.expressCreateResponseMessage(
      res,
      msgFactory.messageTypes.MSG_ERROR_BAD_REQUEST,
      errors
    )
    return
  }
  next()
}
