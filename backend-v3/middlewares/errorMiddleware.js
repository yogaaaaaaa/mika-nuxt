'use strict'

const { validationResult } = require('express-validator')

const uid = require('../libs/uid')
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

    if (err.name === 'SyntaxError') { // parse error
      msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST
      data = err.message
    }

    if (typeof errorMap === 'function') {
      const msgTypeMapped = errorMap(err)
      if (msgTypeMapped) {
        msgType = msgTypeMapped
        data = err.data
      }
    }

    if (!msgType) {
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
  const validationResults = new Set()

  // Handle express-validator
  const expressValidationResults = validationResult(req).array()
  if (expressValidationResults.length > 0) {
    expressValidationResults.forEach(result => {
      if (result.msg === 'Invalid value') {
        validationResults.add(`${result.location}.${result.param}`)
      } else {
        validationResults.add(`${result.location}.${result.param}: ${result.msg}`)
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
          validationResults.add(`${location}.${result.field}: ${result.message}`)
        )
      })
    }
  }

  if (validationResults.size) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION,
      Array.from(validationResults)
    )
    return
  }

  next()
}

/**
 * Handle sequelize error, like `SequelizeForeignKeyConstraintError`
 */
module.exports.sequelizeErrorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    if (err.reltype) { // works in mysql/mariadb
      if (err.reltype === 'parent') {
        msg.expressResponse(
          res,
          msg.msgTypes.MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_PARENT
        )
        return
      } else if (err.reltype === 'child') {
        msg.expressResponse(
          res,
          msg.msgTypes.MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_CHILD,
          err.fields
        )
        return
      }
    } else if (err.original) {
      if (err.original.code === '23503') { // foreign_key_violation in postgres
        const detailKeyParent = /^Key \((.+)\)=\((.+)\) is still referenced from table "(.+)"\./
        const detailKeyChild = /^Key \((.+)\)=\((.+)\) is not present in table "(.+)"\./
        let detailMatch

        detailMatch = err.original.detail.match(detailKeyParent)
        if (detailMatch) {
          msg.expressResponse(
            res,
            msg.msgTypes.MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_PARENT
          )
          return
        }

        detailMatch = err.original.detail.match(detailKeyChild)
        if (detailMatch) {
          msg.expressResponse(
            res,
            msg.msgTypes.MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_CHILD,
            [
              `${err.original.table}.${detailMatch[1]}`
            ]
          )
          return
        }
      }
    }
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
