'use strict'

const _ = require('lodash')
const micromatch = require('micromatch')
const { query } = require('express-validator/check')
const { sanitizeQuery } = require('express-validator/filter')

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
      if (i === fieldComps.length - 1) { // check attributes
        if (!models[fieldComps[i - 1]].rawAttributes.hasOwnProperty(fieldComps[i])) return false // correct property of previous model
        if (models[fieldComps[i - 1]].rawAttributes[fieldComps[i]].type.constructor.name === Sequelize.VIRTUAL.name) return false // property is not virtual
      } else { // check models relation
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

function matchFieldPatterns (field, bannedFields = null, acceptedFields = null) {
  if (Array.isArray(bannedFields)) {
    if (micromatch.isMatch(field, bannedFields)) return false
  } else if (Array.isArray(acceptedFields)) {
    if (!micromatch.isMatch(field, acceptedFields)) return false
  }
  return true
}

/**
 * Validator for paginationToSequelize middleware,
 * `validModels` is included as parameter to check if `req.query.order_by` is valid in model
 */
module.exports.paginationToSequelizeValidator = (validModels, bannedFields = null, acceptedFields = null) => [
  query('page').isNumeric().optional(),
  query('per_page').isNumeric().optional(),
  query('get_count').isBoolean().optional(),
  query('order')
    .isIn(['desc', 'asc'])
    .optional(),
  query('order_by')
    .custom(orderByField => {
      if (!matchFieldPatterns(orderByField, bannedFields, acceptedFields)) return false
      return validateFieldComponents(validModels, orderByField.split('.'))
    })
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
      return models[model.name].scope(Object.assign(model._scope, {
        offset: (req.query.page - 1) * req.query.per_page,
        limit: req.query.per_page,
        order: [
          orderBy
        ]
      }))
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
module.exports.filtersToSequelizeValidator = (validModels, bannedFields = null, acceptedFields = null) => [
  (req, res, next) => {
    if (_.isPlainObject(req.query.f) && !_.isPlainObject(req.query.filters)) {
      req.query.filters = req.query.f
    } else if (_.isPlainObject(req.query.f) && _.isPlainObject(req.query.filters)) {
      Object.assign(req.query.filters, req.query.f)
    }
    next()
  },
  query('filters')
    .custom((filters) => {
      if (!_.isPlainObject(filters)) return false
      for (const filterKey of Object.keys(filters)) {
        let field = filterKey.split(',')[0]
        if (!matchFieldPatterns(field, bannedFields, acceptedFields)) return false
        if (!validateFieldComponents(validModels, field.split('.'))) return false
        if (Array.isArray(filters[filterKey])) {
          if (filters[filterKey].some((filterContent) => typeof filterContent !== 'string')) return false
        } else if (typeof filters[filterKey] !== 'string') {
          return false
        }
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
      case 'neq':
        return {
          [field]: { [Op.ne]: value }
        }
      case 'eqtrue':
        return {
          [field]: true
        }
      case 'eqfalse':
        return {
          [field]: false
        }
      case 'eqnull':
        return {
          [field]: null
        }
      case 'neqnull':
        return {
          [field]: { [Op.ne]: null }
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

  if (_.isPlainObject(req.query.filters)) {
    filters = {}
    eagerFilters = {}

    Object.keys(req.query.filters).forEach((filterKey) => {
      let filterKeySplit = filterKey.split(',')

      let field = filterKeySplit[0]
      let fieldProperty = field.split('.').pop()
      let groupOp = (filterKeySplit[1] || 'and').toLowerCase()
      if (groupOp === 'or') {
        groupOp = Op.or
      } else {
        groupOp = Op.and
      }

      let filterContents = Array.isArray(req.query.filters[filterKey]) ? req.query.filters[filterKey] : [req.query.filters[filterKey]]

      filterContents.forEach((filterContent) => {
        let filterContentSplit = filterContent.split(',')
        let op = filterContentSplit[0]
        let value = filterContentSplit.length > 1 ? filterContentSplit.slice(1, filterContentSplit.length).join(',') : ''

        let targetFilters = field.indexOf('.') > 0 ? eagerFilters : filters

        let translatedOp = translateOp(fieldProperty, op, value)
        if (translatedOp) {
          if (!targetFilters[field]) targetFilters[field] = {}
          if (targetFilters[field][groupOp]) {
            targetFilters[field][groupOp].push(translatedOp)
          } else {
            targetFilters[field][groupOp] = [translatedOp]
          }
        }
      })
    })
  }

  req.applySequelizeFiltersScope = (model) => {
    const eagerTraverse = (query, fields, where, level = 0) => {
      if (level === (fields.length - 1)) {
        if (!_.isPlainObject(query)) { // convert direct model include to plain object
          query = { model: query }
        }

        if (!query.where) query.where = {}
        if (!query.where[Op.and]) query.where[Op.and] = []
        if (_.isPlainObject(query.where[Op.and])) {
          query.where[Op.and] = [ query.where[Op.and] ]
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
                if (typeof query.required !== 'boolean' && level > 0) query.required = true
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
      let prevScope = model._scope

      if (!prevScope.where) prevScope.where = {}
      if (!prevScope.where[Op.and]) prevScope.where[Op.and] = []
      if (_.isPlainObject(prevScope.where[Op.and])) {
        prevScope.where[Op.and] = [ prevScope.where[Op.and] ]
      }
      Object.keys(filters).forEach(field => prevScope.where[Op.and].push(filters[field]))

      Object.keys(eagerFilters).forEach(field => eagerTraverse(prevScope, field.split('.'), eagerFilters[field]))

      return models[model.name].scope(prevScope)
    }
  }

  next()
}

module.exports.commonValidator = [
  query('archived').isBoolean().optional(),
  query('deep_archived').isBoolean().optional() // unused for now
]

module.exports.commonToSequelize = (req, res, next) => {
  req.applySequelizeCommonScope = (model) => {
    if (model) {
      let prevScope = model._scope
      if (req.query.archived) prevScope.paranoid = false

      return models[model.name].scope(prevScope)
    }
  }
  next()
}

/**
 * Validator for timeGroupToSequelize, include `model` as parameter
 * to check if `req.query.group_field` is valid in model and with correct data type
 */
module.exports.timeGroupToSequelizeValidator = (validModel) => [
  (req, res, next) => {
    req.query.group = req.query.group || 'createdAt'
    req.query.group_time = req.query.group_time || 'hour'
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
module.exports.timeGroupToSequelize = (req, res, next) => {
  let offsetComponents = req.query.utc_offset.match(/([+-])([0-2]\d):?([0-5]\d)/)
  let offsetMinutes = (parseInt(`${offsetComponents[1]}1`)) * (parseInt(offsetComponents[2]) * 60) + parseInt(offsetComponents[3])

  let fieldName = req.query.group.split('.').map(comp => `\`${comp}\``).join('.')

  let group = [
    Sequelize.literal(
      `${req.query.group_time !== 'day' ? req.query.group_time.toUpperCase() : 'DATE'}(DATE_ADD(${fieldName}, INTERVAL ${offsetMinutes} MINUTE))`
    )
  ]

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
