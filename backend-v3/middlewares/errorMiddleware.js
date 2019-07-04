'use strict'

const { validationResult } = require('express-validator')
const msg = require('../libs/msg')

const isEnvProduction = process.env.NODE_ENV === 'production'

/**
 * Not found handler middleware, place before errorHandler
 */
module.exports.notFoundErrorHandler = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_ERROR_NOT_FOUND
  )
}

/**
 * General error handler middleware
 */
module.exports.errorHandler = (err, req, res, next) => {
  if (err) {
    console.error(err.stack)

    let msgTypes = msg.msgTypes.MSG_ERROR
    let data = isEnvProduction ? undefined : err.stack.split('\n')

    if (err.status === 400) { // status assigned by body-parser when encounter parsing error
      msgTypes = msg.msgTypes.MSG_ERROR_BAD_REQUEST
    }

    msg.expressResponse(
      res,
      msgTypes,
      data
    )
  }
}

/**
 * Handle validator error
 */
module.exports.validatorErrorHandler = (req, res, next) => {
  const validationErrors = validationResult(req).array()
  if (validationErrors.length > 0) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION,
      validationErrors.map((data) => {
        if (data.msg === 'Invalid value') {
          return `${data.location}.${data.param}`
        } else {
          return `${data.location}.${data.param}: ${data.msg}`
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
    if (err.reltype === 'parent') {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_PARENT
      )
    } else if (err.reltype === 'child') {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_CHILD,
        err.fields
      )
    }
    return
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    if (Array.isArray(err.errors)) {
      let data
      try {
        data = err.errors.map(error => `${error.instance._modelOptions.name.singular}.${error.path}`)
      } catch (err) {
        data = err.fields
      }
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_BAD_REQUEST_UNIQUE_CONSTRAINT,
        data
      )
      return
    }
  }
  throw err
}
