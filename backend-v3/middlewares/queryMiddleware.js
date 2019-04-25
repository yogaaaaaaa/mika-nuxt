'use strict'

const moment = require('moment')
const { query } = require('express-validator/check')

const models = require('../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

/**
 * Validator for paginationToSequelize middleware,
 * `model` is included as parameter to check if `req.query.order_by` is valid in model
 */
module.exports.paginationToSequelizeValidator = (model) => [
  query('page').isNumeric().optional(),
  query('per_page').isNumeric().optional(),
  query('get_count').isBoolean().optional(),
  query('order')
    .isIn(['desc', 'asc'])
    .optional()
    .withMessage('Invalid order type, use \'desc\' for descending or \'asc\' for ascending'),
  query('order_by')
    .custom(val => models[model].rawAttributes.hasOwnProperty(val))
    .optional()
    .withMessage('Invalid field name in order_by')
]

/**
 * Generate sequelize query setting for pagination in `req.sequelizePagination` or
 * apply to existing query via `req.applyPaginationSequelize` function
 */
module.exports.paginationToSequelize = (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  req.query.get_count = req.query.get_count || false

  req.query.order = req.query.order || 'desc'
  req.query.order_by = req.query.order_by || 'createdAt'

  req.paginationSequelize = {
    offset: (req.query.page - 1) * req.query.per_page,
    limit: req.query.per_page,
    order: [
      [req.query.order_by, req.query.order]
    ]
  }
  req.applyPaginationSequelize = (query) => {
    if (typeof query !== 'object') return
    Object.assign(query, req.paginationSequelize)
  }
  next()
}

/**
 * Validator for filtersToSequelize middleware,
 * `model` is included as parameter to check whether field name in `filters` is valid
 */
module.exports.filtersToSequelizeValidator = (model) => [
  query('filters')
    .custom((filters) => {
      if (!Array.isArray(filters)) return false
      for (const filter of filters) {
        if (!models[model].rawAttributes.hasOwnProperty(filter.split(',')[0])) return false
      }
      return true
    })
    .optional()
    .withMessage('Invalid field name in filters[]')
]

/**
 * Generate sequelize query setting for simple filter,
 * via array in query string (`req.query.filters`)
 *
 * Generated query setting is available in `req.filtersWhereSequelize` to be inserted to `where` of sequelize query setting.
 * Filters setting can be applied to existing query via `req.applyFiltersWhereSequelize` function
 *
 * Each element of `filters[]` is consist of 3 parts, delimited by comma :
 *
 * `(field name in selected model),(operator),(value)`
 *
 * To filter for field with `status` equal to `success` its translate
 * to `filters[]=status,eq,success` of query string.
 *
 * Another example of query string :
 * `filters[]=status,eq,success&filters[]=createdAt,lastday,1`
 */
module.exports.filtersToSequelize = (req, res, next) => {
  req.filtersWhereSequelize = {}
  req.applyFiltersWhereSequelize = (query) => {
    if (typeof query !== 'object') return
    if (!query.where) query.where = {}
    Object.assign(query.where, req.filtersWhereSequelize)
  }

  if (!Array.isArray(req.query.filters)) return next()

  let andFilters = []
  for (const filter of req.query.filters) {
    let filterSplit = filter.split(',')
    if (filterSplit.length >= 2) {
      let field = filterSplit[0]
      let op = filterSplit[1]

      let value = ''

      if (filterSplit.length > 2) {
        value = filterSplit.slice(2, filterSplit.length).join(',')
      }

      switch (op) {
        case 'eq':
          andFilters.push({
            [field]: value
          })
          break
        case 'ne':
          andFilters.push({
            [field]: { [Op.ne]: value }
          })
          break
        case 'gt':
          andFilters.push({
            [field]: { [Op.gt]: value }
          })
          break
        case 'gte':
          andFilters.push({
            [field]: { [Op.gte]: value }
          })
          break
        case 'lt':
          andFilters.push({
            [field]: { [Op.lt]: value }
          })
          break
        case 'lte':
          andFilters.push({
            [field]: { [Op.lte]: value }
          })
          break
        case 'like':
          andFilters.push({
            [field]: { [Op.like]: value }
          })
          break
        case 'lasthour':
          value = parseInt(value) || 0
          andFilters.push({
            [field]: {
              [Op.gte]: moment().utc().subtract(value, 'hour').startOf('hour').toDate(),
              [Op.lte]: moment().utc().toDate()
            }
          })
          break
        case 'lastday':
          value = parseInt(value) || 0
          andFilters.push({
            [field]: {
              [Op.gte]: moment().utc().subtract(value, 'day').startOf('day').toDate(),
              [Op.lte]: moment().utc().toDate()
            }
          })
          break
        case 'lastweek':
          value = parseInt(value) || 0
          andFilters.push({
            [field]: {
              [Op.gte]: moment().utc().subtract(value, 'week').startOf('week').toDate(),
              [Op.lte]: moment().utc().toDate()
            }
          })
          break
        case 'lastmonth':
          value = parseInt(value) || 0
          andFilters.push({
            [field]: {
              [Op.gte]: moment().utc().subtract(value, 'month').startOf('month').toDate(),
              [Op.lte]: moment().utc().toDate()
            }
          })
          break
      }
    }
  }

  if (andFilters.length) {
    req.filtersWhereSequelize = {
      [Op.and]: andFilters
    }
  }

  next()
}

/**
 * Validator for timeGroupToSequelize, include `model` as parameter
 * to check if `req.query.group_field` is valid in model and with correct data type
 */
module.exports.timeGroupSequelize = (model) => [
  query('group_offset').custom((val) => val.match(/[+-][0-2]\d:?[0-5]\d/)).optional(),
  query('group_time').isIn(['minute', 'hour', 'day', 'month', 'year']).optional(),
  query('group_field')
    .custom(val => models[model].rawAttributes[val].type.constructor.name === Sequelize.DATE.name)
]

/**
 * Generate sequelize group (aggregation) by time query setting
 */
module.exports.timeGroupToSequelize = (req, res, next) => {
  req.query.group_field = req.query.group_field || 'createdAt'
  req.query.group_time = req.query.group_time || 'hour'
  req.query.group_offset = req.query.group_offset || '+0000'

  let offsetComponents = req.query.group_offset.match(/([+-])([0-2]\d):?([0-5]\d)/)
  let offsetMinutes = (parseInt(`${offsetComponents[1]}1`)) * (parseInt(offsetComponents[2]) * 60) + parseInt(offsetComponents[3])

  req.timeGroupSequelize = [
    Sequelize.literal(`${req.query.group_time !== 'day' ? req.query.group_time.toUppercase() : 'DATE'}(DATE_ADD(\`${req.query.group_field}\`, INTERVAL ${offsetMinutes} MINUTE))`)
  ]

  req.applyTimeGroupSequelize = (query) => {
    if (typeof query !== 'object') return
    if (!Array.isArray(query.group)) query.group = []
    query.group.push(req.timeGroupSequelize)
  }
  next()
}
