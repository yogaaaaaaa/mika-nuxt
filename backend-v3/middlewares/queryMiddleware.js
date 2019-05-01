'use strict'

const _ = require('lodash')
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
 * `validModels` is included as parameter to check whether field name in `filters` is valid
 * NOTE: first index of `validModels` must be the top model
 */
module.exports.filtersToSequelizeValidator = (validModels) => [
  query('filters')
    .custom((filters) => {
      for (const filter of _.flatten(_.values(filters))) {
        let field = filter.split(',')[0]
        let fieldComponents = field.split('.')

        if (fieldComponents.length > 1) {
          if (
            !validModels[0] === fieldComponents[0] || // correct top model
            !models[validModels[0]].associations[fieldComponents[0]] || // correct association with top model
            !models[fieldComponents[0]] // included in valid models
          ) return false
          for (let i = 1; i < fieldComponents.length; i++) {
            if (i === fieldComponents.length - 1) {
              if (!models[fieldComponents[i - 1]].rawAttributes.hasOwnProperty(fieldComponents[i])) return false // correct property of previous model
            } else {
              if (!validModels.includes(fieldComponents[i])) return false
              if (!models[fieldComponents[i - 1]].associations[fieldComponents[i]]) return false // correct association of top model
            }
          }
        } else {
          if (!models[validModels[0]].rawAttributes.hasOwnProperty(field)) return false
        }
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
 * `(field name in selected model and its association),(operator),(value)`
 *
 * To filter for field with `status` equal to `success` its translate
 * to `filters[]=status,eq,success` of query string.
 *
 * Example of query string :
 * `filters[]=status,eq,success&filters[]=name,like,%name%`
 *
 * When query param of filter is included with name e.g `filter[a]` it will group with logical or operation.
 * In sense, `filters` parameter is in form minterm.
 *
 * Another example :
 *
 * `filters[a]=status,eq,success&filters[a]=name,like,%name%&filters[]=amount,gt,2000&filters[]=paymentProvider.paymentProviderType.class,eq,tcash`
 *
 * It translate to :
 *
 * `((status = success) or (name like %name%)) and (amount > 2000) and (paymentProvider.paymentProviderType.class = tcash)`
 */
module.exports.filtersToSequelize = (req, res, next) => {
  req.filtersWhereSequelize = {}
  req.applyFiltersWhereSequelize = (query) => {
    if (typeof query !== 'object') return
    if (!query.where) query.where = {}
    Object.assign(query.where, req.filtersWhereSequelize)
  }

  const parseFilter = (filter) => {
    let filterSplit = filter.split(',')
    if (filterSplit.length >= 2) {
      let field = filterSplit[0].indexOf('.') ? `$${filterSplit[0]}$` : filterSplit[0]
      let op = filterSplit[1]
      let value = filterSplit.length > 2 ? filterSplit.slice(2, filterSplit.length).join(',') : ''
      switch (op) {
        case 'eq':
          return {
            [field]: value
          }
        case 'eqnull':
          return {
            [field]: null
          }
        case 'ne':
          return {
            [field]: { [Op.ne]: value }
          }
        case 'gt':
          return {
            [field]: { [Op.gt]: value }
          }
        case 'gte':
          return {
            [field]: { [Op.gte]: value }
          }
        case 'lt':
          return {
            [field]: { [Op.lt]: value }
          }
        case 'lte':
          return {
            [field]: { [Op.lte]: value }
          }
        case 'like':
          return {
            [field]: { [Op.like]: value }
          }
      }
    }
  }

  let andFilters = []
  for (const filter of _.values(req.query.filters)) {
    if (Array.isArray(filter)) {
      let orFilter = []
      for (const subFilter of filter) {
        orFilter.push(parseFilter(subFilter))
      }
      if (orFilter.length) {
        andFilters.push({
          [Op.or]: orFilter
        })
      }
    } else {
      andFilters.push(parseFilter(filter))
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
  query('group_tz_offset')
    .custom((val) => val.match(/[+-][0-2]\d:?[0-5]\d/))
    .optional(),
  query('group_time')
    .isIn(['minute', 'hour', 'day', 'month', 'year'])
    .optional(),
  query('group_field')
    .custom(val => models[model].rawAttributes[val].type.constructor.name === Sequelize.DATE.name)
    .optional()
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
