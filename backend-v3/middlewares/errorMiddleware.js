'use strict'

const { validationResult } = require('express-validator/check')
const msgFactory = require('../helpers/msgFactory')

/**
 * Not found handler middleware, place before errorHandler
 */
module.exports.notFoundErrorHandler = (req, res, next) => {
  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_ERROR_NOT_FOUND
  )
}

/**
 * General error handler middleware
 */
module.exports.errorHandler = (err, req, res, next) => {
  if (err) {
    console.log(err.stack)
    if (err.status === 400) { // status assigned by body-parser when encounter parsing error
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST
      )
    } else {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR
      )
    }
  }
}

/**
 * Handle validator error
 */
module.exports.validatorErrorHandler = (req, res, next) => {
  const validationErrors = validationResult(req).array()
  if (validationErrors.length > 0) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_BAD_REQUEST_VALIDATION,
      validationErrors.map((data) => {
        return `${data.msg} on ${data.location}.${data.param}`
      })
    )
    return
  }
  next()
}
