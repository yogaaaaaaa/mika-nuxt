'use strict'

const _ = require('lodash')
const { query } = require('express-validator/check')

const models = require('../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

function validateFieldComponents (validModels, fieldComps) {
  if (fieldComps.length > 1) {
    if (
      !models[validModels[0]].associations[fieldComps[0]] || // correct association with top model
      !models[fieldComps[0]] // included in valid models
    ) return false
    for (let i = 1; i < fieldComps.length; i++) {
      if (i === fieldComps.length - 1) {
        if (!models[fieldComps[i - 1]].rawAttributes.hasOwnProperty(fieldComps[i])) return false // correct property of previous model
        if (models[fieldComps[i - 1]].rawAttributes[fieldComps[i]].type.constructor.name === Sequelize.VIRTUAL.name) return false // property is not virtual
      } else {
        if (!validModels.includes(fieldComps[i])) return false // included in valid models
        if (!models[fieldComps[i - 1]].associations[fieldComps[i]]) return false // correct association of previous model
      }
    }
  } else {
    if (!models[validModels[0]].rawAttributes.hasOwnProperty(fieldComps[0])) return false // correct property of top model
    if (models[validModels[0]].rawAttributes[fieldComps[0]].type.constructor.name === Sequelize.VIRTUAL.name) return false // property is not virtual
  }
  return true
}

/**
 * Validator for paginationToSequelize middleware,
 * `validModels` is included as parameter to check if `req.query.order_by` is valid in model
 */
module.exports.paginationToSequelizeValidator = (validModels) => [
  query('page').isNumeric().optional(),
  query('per_page').isNumeric().optional(),
  query('get_count').isBoolean().optional(),
  query('order')
    .isIn(['desc', 'asc'])
    .optional(),
  query('order_by')
    .custom(orderByField => validateFieldComponents(validModels, orderByField.split('.')))
    .optional()
]

/**
 * Generate sequelize query setting for pagination in `req.sequelizePagination` or
 * apply to existing query via `req.applySequelizePaginationScope` function
 */
module.exports.paginationToSequelize = (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  req.query.get_count = req.query.get_count || false

  req.query.order = req.query.order || 'desc'
  req.query.order_by = req.query.order_by || 'createdAt'

  let fieldComponents = req.query.order_by.split('.')
  let orderBy = fieldComponents.map((fieldComponent) => {
    if (models[fieldComponent]) {
      return models[fieldComponent]
    } else {
      return fieldComponent
    }
  })
  orderBy.push(req.query.order)

  req.applySequelizePaginationScope = (model) => {
    if (model) {
      if (model._scope && typeof model.scope === 'function') {
        return models[model.name].scope(Object.assign(model._scope, {
          offset: (req.query.page - 1) * req.query.per_page,
          limit: req.query.per_page,
          order: [
            orderBy
          ]
        }))
      }
    }
  }

  next()
}

/**
 * Validator for filtersToSequelize middleware,
 * `validModels` is included as parameter to check whether field name in `filters` is valid
 *
 * NOTE: first index of `validModels` must be the top model
 */
module.exports.filtersToSequelizeValidator = (validModels) => [
  query('deleted').isBoolean().optional(),
  query('filters')
    .custom((filters) => {
      for (const filter of _.flatten(_.values(filters))) {
        let field = filter.split(',')[0]
        if (!validateFieldComponents(validModels, field.split('.'))) return false
      }
      return true
    })
    .optional()
]

/**
 * Generate sequelize query setting for simple filter,
 * via array in query string (`req.query.filters`)
 *
 * Filters setting can be applied as models scope via `req.applySequelizeFiltersScope` function which receive
 * Scoped model
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
 * It translate to :
 *
 * `(status = success) and (name like %name%)`
 *
 * Another example :
 *
 * `filters[]=status,eq,success&filters[]=status,eq,failed&filters[]=amount,gt,2000&filters[]=acquirer.acquirerType.class,eq,tcash`
 *
 * It translate to :
 *
 * `((status = success) or (status = failed)) and (amount > 2000) and (acquirer.acquirerType.class = tcash)`
 */
module.exports.filtersToSequelize = (req, res, next) => {
  let filters = null
  let eagerFilters = null

  const translateOp = (field, op, value) => {
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

  if (Array.isArray(req.query.filters)) {
    filters = {}
    eagerFilters = {}

    req.query.filters.forEach(filter => {
      let filterSplit = filter.split(',')

      let field = filterSplit[0]
      let fieldProperty = field.split('.')
      fieldProperty = fieldProperty[fieldProperty.length - 1]
      let op = filterSplit[1]
      let value = filterSplit.length > 2 ? filterSplit.slice(2, filterSplit.length).join(',') : ''

      let targetFilters = field.indexOf('.') > 0 ? eagerFilters : filters

      if (targetFilters[field]) {
        if (targetFilters[field][Op.or]) {
          targetFilters[field][Op.or].push(translateOp(fieldProperty, op, value))
        } else {
          targetFilters[field] = {
            [Op.or]: [targetFilters[field], translateOp(fieldProperty, op, value)]
          }
        }
      } else {
        targetFilters[field] = translateOp(fieldProperty, op, value)
      }
    })
  }

  req.applySequelizeFiltersScope = (model) => {
    const eagerTraverse = (query, fields, where, level = 0) => {
      if (level === (fields.length - 1)) {
        if (!_.isPlainObject(query)) { // convert direct model include to plain object
          query = { model: query }
        }
        if (!_.isPlainObject(query.where)) {
          query.where = {}
        }
        if (!Array.isArray(query.where[Op.and])) {
          query.where[Op.and] = []
        }
        query.where[Op.and].push(where)
        return
      }

      if (_.isPlainObject(query)) {
        if (Array.isArray(query.include)) {
          for (let i = 0; i < query.include.length; i++) {
            if (!_.isPlainObject(query.include[i])) {
              query.include[i] = { model: query.include[i] } // convert direct model include to plain object
            }
            if (query.include[i].model.name === fields[level]) {
              if (!(fields.length - 2 === level) && !Array.isArray(query.include[i].include)) {
                throw Error('invalid model in fields')
              } else {
                eagerTraverse(query.include[i], fields, where, (level + 1))
              }
              return
            }
          }
        }
      }
    }

    if (!filters && !eagerFilters) {
      return model
    }

    if (model) {
      if (model._scope && typeof model.scope === 'function') {
        let query = model._scope
        if (req.query.deleted) query.paranoid = false
        if (!query.where) query.where = {}
        query.where[Op.and] = _.values(filters)
        Object.keys(eagerFilters).forEach(field => eagerTraverse(query, field.split('.'), eagerFilters[field]))
        return models[model.name].scope(query)
      }
    }
  }

  next()
}

/**
 * Validator for timeGroupToSequelize, include `model` as parameter
 * to check if `req.query.group_field` is valid in model and with correct data type
 */
module.exports.timeGroupToSequelizeValidator = (model) => [
  query('group')
    .custom(val => models[model].rawAttributes[val].type.constructor.name === Sequelize.DATE.name)
    .optional(),
  query('group_tz')
    .custom((val) => val.match(/[+-][0-2]\d:?[0-5]\d/))
    .optional(),
  query('group_time')
    .isIn(['minute', 'hour', 'day', 'month', 'year'])
    .optional()
]

/**
 * Generate sequelize group (aggregation) by time query setting
 */
module.exports.timeGroupToSequelize = (req, res, next) => {
  req.query.group = req.query.group || 'createdAt'
  req.query.group_time = req.query.group_time || 'hour'
  req.query.group_tz = req.query.group_tz || '+0000'

  let offsetComponents = req.query.group_offset.match(/([+-])([0-2]\d):?([0-5]\d)/)
  let offsetMinutes = (parseInt(`${offsetComponents[1]}1`)) * (parseInt(offsetComponents[2]) * 60) + parseInt(offsetComponents[3])

  let group = [
    Sequelize.literal(`${req.query.group_time !== 'day' ? req.query.group_time.toUppercase() : 'DATE'}(DATE_ADD(\`${req.query.group}\`, INTERVAL ${offsetMinutes} MINUTE))`)
  ]

  req.applySequelizeTimeGroupScope = (model) => {
    if (model) {
      if (model._scope && typeof model.scope === 'function') {
        let query = model._scope
        if (!query.group) query.group = []
        query.group.push(group)
        return models[model.name].scope(query).scope({
          attributes: [ req.query.group ]
        })
      }
    }
  }
  next()
}
