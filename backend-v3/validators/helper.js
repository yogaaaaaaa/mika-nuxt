'use strict'

const _ = require('lodash')

module.exports.default = (object, path, value) => {
  _.set(object, path, value)
}

module.exports.defaultExist = (object, path, value) => {
  if (_.has(object, path)) {
    _.set(object, path, value)
  }
}

module.exports.defaultNotExist = (object, path, value) => {
  if (!_.has(object, path)) {
    _.set(object, path, value)
  }
}

module.exports.defaultExistConditional = (object, path, truthyValue, falsyValue) => {
  if (_.has(object, path)) {
    let value = _.get(object, path)
    if (value) {
      _.set(object, path, truthyValue)
    } else {
      _.set(object, path, falsyValue)
    }
  }
}

module.exports.removeExist = (object, path) => {
  if (_.has(object, path)) _.unset(object, path)
}

/**
 * Return a middleware to force property/field to certain value
 * in `req.body`
 */
module.exports.bodyDefault = (field, value) => (req, res, next) => {
  exports.default(req.body, field, value)
  next()
}

/**
 * Return a middleware to force property/field to certain value
 * if exist in `req.body`
 */
module.exports.bodyDefaultExist = (field, value) => (req, res, next) => {
  exports.defaultExist(req.body, field, value)
  next()
}

/**
 * Return a middleware to force property/field to certain value
 * in not exist in `req.body`
 */
module.exports.bodyDefaultNotExist = (field, value) => (req, res, next) => {
  exports.defaultNotExist(req.body, field, value)
  next()
}

/**
 * Return a middleware to force property/field to certain value if exist in `req.body`,
 * with conditional truthy or falsy value
 */
module.exports.bodyDefaultExistConditional = (field, truthyValue, falsyValue) => (req, res, next) => {
  exports.defaultExistConditional(req.body, field, truthyValue, falsyValue)
  next()
}

/**
 * Return a middleware to remove property/field to certain value
 * if exist in `req.body`
 */
module.exports.bodyRemove = (field) => (req, res, next) => {
  exports.removeExist(req.body, field)
  next()
}

module.exports.archivedAtValidator = exports.bodyDefaultExistConditional('archivedAt', true, false)
module.exports.idValidator = exports.bodyRemove('id')
