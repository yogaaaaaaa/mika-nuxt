'use strict'

const uid = require('../libs/uid')

const { validationResult } = require('express-validator')
const msg = require('../libs/msg')

const commonConfig = require('../configs/commonConfig')

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
    const errorRef = `${commonConfig.name}-error-${uid.ksuid.randomSync().string}`
    const data = { errorRef }
    let msgTypes = msg.msgTypes.MSG_ERROR

    if (err.status === 400) { // status assigned by body-parser when encounter parsing error
      msgTypes = msg.msgTypes.MSG_ERROR_BAD_REQUEST
    }

    console.error('START errorRef :', errorRef)
    console.error(err.stack)
    console.error('END errorRef :', errorRef)

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
