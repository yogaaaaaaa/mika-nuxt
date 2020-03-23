'use strict'

const { query } = require('express-validator')
const _ = require('lodash')

const passwd = require('../libs/passwd')

/**
 * Generic pagination/order validator
 */
module.exports.paginationValidator = [
  query('page').isNumeric().optional(),
  query('per_page').isNumeric().optional(),
  query('get_count').isBoolean().optional(),
  query('order')
    .isIn(['desc', 'asc'])
    .optional(),
  query('order_by')
    .isString()
    .optional()
]

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
    const value = _.get(object, path)
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
 * Return a middleware to remove property/field if exist in `req.body`
 */
module.exports.bodyRemove = (field) => (req, res, next) => {
  exports.removeExist(req.body, field)
  next()
}

/**
 * Return a middleware to force property/field in `req.params` to default value
 * if its not integer
 */
module.exports.paramsDefaultNotInteger = (field, value) => (req, res, next) => {
  if (req.params[field]) {
    req.params[field] = req.params[field].match(/^[-+]\d+/) ? req.params[field] : value
  }
  next()
}

/**
 * Custom validator whether password is Valid to mika standard
 */
module.exports.isStandardPassword = (password) => {
  if (password) {
    return passwd.standardPasswordValidator.validate(password)
  } else {
    return false
  }
}

module.exports.archivedAtValidator = exports.bodyDefaultExistConditional('archivedAt', true, false)
module.exports.idValidator = exports.bodyRemove('id')
module.exports.createdAtValidator = exports.bodyRemove('createdAt')
