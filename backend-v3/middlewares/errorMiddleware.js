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
    console.error(err.stack)
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
      msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION,
      validationErrors.map((data) => {
        if (data.msg === 'Invalid value') {
          return `${data.msg} on ${data.location}.${data.param}`
        } else {
          return data.msg
        }
      })
    )
    return
  }
  next()
}

/**
 * Handle sequelize error, like `foreignKeyConstraint`
 */
module.exports.sequelizeErrorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    if (Array.isArray(err.fields)) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION_FOREIGN_KEY,
        err.fields.map((field) => `Invalid identifier ${field}`)
      )
    }
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    if (Array.isArray(err.fields)) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION_FOREIGN_KEY,
        err.fields.map((field) => `Unique constraint ${field}`)
      )
    }
  } else {
    throw err
  }
}
