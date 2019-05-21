'use strict'

const _ = require('lodash')

const setIfTruthy = (object, path, value) => {
  if (_.has(object, path)) {
    _.set(object, path, value)
  }
}

module.exports.bodyDefault = (field, value) => (req, res, next) => {
  setIfTruthy(req.body, field, value)
  next()
}

module.exports.bodyIdDefault = (fieldPrefix = '', value = undefined) => (req, res, next) => {
  setIfTruthy(req.body, `${fieldPrefix}id`, value)
  next()
}

module.exports.bodyArchivedAtDefault = (fieldPrefix = '', value = new Date()) => (req, res, next) => {
  setIfTruthy(req.body, `${fieldPrefix}archivedAt`, value)
  next()
}
