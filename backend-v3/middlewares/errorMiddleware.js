'use strict'

const uid = require('../libs/uid')

const { validationResult } = require('express-validator')
const msg = require('../libs/msg')

const commonConfig = require('../configs/commonConfig')

/**
 * General Not found handler middleware.
 *
 * Place before errorHandler
 */
module.exports.notFoundErrorHandler = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_ERROR_NOT_FOUND
  )
}

/**
 * General error handler middleware.
 *
 * Optionally, errorMap can be included as parameter to translate
 * errorTypes to certain msgTypes
 */
module.exports.errorHandler = (errorMap) => (err, req, res, next) => {
  if (err) {
    let msgType
    let data

    if (errorMap) msgType = errorMap(err)

    if (err.status === 400) { // status assigned by body-parser when encounter parsing error
      msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST
    } else if (!msgType) {
      msgType = msg.msgTypes.MSG_ERROR
      const errorRef = `${commonConfig.name}-error-${uid.ksuid.randomSync().string}`
      data = { errorRef }
      console.error('START errorRef :', errorRef)
      console.error(err.stack)
      console.error('END errorRef :', errorRef)
    }

    msg.expressResponse(
      res,
      msgType,
      data
    )
  }
}

/**
 * Handle validator error
 */
module.exports.validatorErrorHandler = (req, res, next) => {
  const validationResults = []

  // Handle express-validator
  const expressValidationResults = validationResult(req).array()
  if (expressValidationResults.length > 0) {
    expressValidationResults.forEach(result => {
      if (result.msg === 'Invalid value') {
        validationResults.push(`${result.location}.${result.param}`)
      } else {
        validationResults.push(`${result.location}.${result.param}: ${result.msg}`)
      }
    })
  }

  // Handle fastest-validator
  if (req.fastestValidatorResults) {
    const locations = Object.keys(req.fastestValidatorResults)
    if (locations.length) {
      locations.forEach(location => {
        const results = req.fastestValidatorResults[location]
        results.forEach(result =>
          validationResults.push(`${location}.${result.field}: ${result.message}`)
        )
      })
    }
  }

  if (validationResults.length) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION,
      validationResults
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
