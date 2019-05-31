'use strict'

const { query } = require('express-validator/check')
const { sanitizeQuery } = require('express-validator/filter')

const models = require('../../models')
const Sequelize = models.Sequelize

/**
 * Validator for timeGroupToSequelize, include `model` as parameter
 * to check if `req.query.group_field` is valid in model and with correct data type
 */
module.exports.timeGroupValidator = (validModel) => [
  (req, res, next) => {
    req.query.group = req.query.group || 'createdAt'
    req.query.group_time = req.query.group_time || 'day'
    req.query.utc_offset = req.query.utc_offset || '+0000'
    next()
  },
  query('group')
    .custom((group) => models[validModel].rawAttributes[group].type.constructor.name === Sequelize.DATE.name)
    .optional(),
  sanitizeQuery('group').customSanitizer(group => `${validModel}.${group}`),
  query('group_time')
    .isIn(['minute', 'hour', 'day', 'month', 'year'])
    .optional(),
  query('utc_offset')
    .custom((val) => val.match(/[+-][0-2]\d:?[0-5]\d/))
    .optional()
]

/**
 * Generate sequelize group (aggregation) by time query setting
 */
module.exports.timeGroup = (req, res, next) => {
  let offsetComponents = req.query.utc_offset.match(/([+-])([0-2]\d):?([0-5]\d)/)
  let offsetMinutes = (parseInt(`${offsetComponents[1]}1`)) * (parseInt(offsetComponents[2]) * 60) + parseInt(offsetComponents[3])

  let fieldName = req.query.group.split('.').map(comp => `\`${comp}\``).join('.')

  let group

  if (req.query.group_time === 'minute') {
    group = [
      Sequelize.literal(
        `MINUTE(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      ),
      Sequelize.literal(
        `, HOUR(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      ),
      Sequelize.literal(
        `, DATE(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      )
    ]
  } else if (req.query.group_time === 'hour') {
    group = [
      Sequelize.literal(
        `HOUR(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      ),
      Sequelize.literal(
        `, DATE(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      )
    ]
  } else if (req.query.group_time === 'day') {
    group = [
      Sequelize.literal(
        `DATE(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      )
    ]
  } else if (req.query.group_time === 'month') {
    group = [
      Sequelize.literal(
        `MONTH(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      ),
      Sequelize.literal(
        `, YEAR(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      )
    ]
  } else if (req.query.group_time === 'year') {
    group = [
      Sequelize.literal(
        `YEAR(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
      )
    ]
  }

  req.applySequelizeTimeGroupScope = (model) => {
    if (model) {
      let prevScope = model._scope

      if (Array.isArray(prevScope.group)) {
        prevScope.group.push(group)
      } else {
        prevScope.group = [
          group
        ]
      }

      if (Array.isArray(prevScope.attributes)) {
        prevScope.attributes.push(req.query.group.split('.').pop())
      } else {
        prevScope.attributes = [ req.query.group.split('.').pop() ]
      }

      return models[model.name].scope(prevScope)
    }
  }
  next()
}
