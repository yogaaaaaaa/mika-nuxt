'use strict'

const _ = require('lodash')
const { query } = require('express-validator')
const validator = require('validator')

const helper = require('./helper')
const models = require('../../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

const translateOp = {
  eq: (prop, val) => ({
    [prop]: val
  }),
  neq: (prop, val) => ({
    [prop]: { [Op.ne]: val }
  }),
  eqtrue: (prop, val) => ({
    [prop]: true
  }),
  eqfalse: (prop, val) => ({
    [prop]: true
  }),
  eqnull: (prop, val) => ({
    [prop]: null
  }),
  neqnull: (prop, val) => ({
    [prop]: { [Op.ne]: null }
  }),
  gt: (prop, val) => ({
    [prop]: { [Op.gt]: val }
  }),
  gte: (prop, val) => ({
    [prop]: { [Op.gte]: val }
  }),
  lt: (prop, val) => ({
    [prop]: { [Op.lt]: val }
  }),
  lte: (prop, val) => ({
    [prop]: { [Op.lte]: val }
  }),
  like: (prop, val) => ({
    [prop]: { [Op.iLike]: val }
  })
}

function validateAndCheckFilterContent (field, filterContent, fieldType, errorLists) {
  if (typeof filterContent !== 'string') return

  const validOps = Object.keys(translateOp)
  const filterContentSplit = filterContent.split(',')
  const filterOp = filterContentSplit[0]
  const filterValue = filterContentSplit.length > 1 ? filterContentSplit.slice(1, filterContentSplit.length).join(',') : ''

  if (!validOps.includes(filterOp)) {
    errorLists.push(`invalid op for '${field}'`)
    return
  }

  let value = filterValue
  if (fieldType === 'STRING') {}
  if (fieldType === 'DECIMAL') {
    if (['like', 'eqtrue', 'eqfalse'].includes(filterOp)) {
      errorLists.push(`unsupported op for '${field}'`)
      return
    }
    if (!validator.isFloat(value)) {
      errorLists.push(`invalid value for '${field}'`)
      return
    }
  }
  if (fieldType === 'INTEGER') {
    value = value || '0'
    if (['like', 'eqtrue', 'eqfalse'].includes(filterOp)) {
      errorLists.push(`unsupported op for '${field}'`)
      return
    }
    if (!validator.isInt(value)) {
      errorLists.push(`invalid value for '${field}'`)
      return
    }
  }
  if (fieldType === 'DATE') {
    if (['like', 'eqtrue', 'eqfalse'].includes(filterOp)) {
      errorLists.push(`unsupported op for '${field}'`)
      return
    }
    if (!validator.isISO8601(value) || !validator.isRFC3339(value)) {
      errorLists.push(`invalid value for '${field}'`)
      return
    }
  }
  return `${filterOp},${value}`
}

/**
 * Validator for filter middleware,
 * `validModels` is included as parameter to check whether field name in `filters[]`/`f[]` is valid
 *
 * NOTE: first index of `validModels` must be the top model
 */
module.exports.filterValidator = (validModels, bannedFields = null, acceptedFields = null) => [
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
      const errorLists = []
      if (!_.isPlainObject(filters)) return false
      for (const filterKey of Object.keys(filters)) {
        const field = filterKey.split(',')[0]
        if (!helper.matchFieldPatterns(field, bannedFields, acceptedFields)) return false
        const fieldType = helper.validateFieldComponents(validModels, field)

        if (!fieldType) {
          errorLists.push(`invalid field '${field}'`)
          continue
        }

        if (Array.isArray(filters[filterKey])) {
          for (let i = 0; i < filters[filterKey].length; i++) {
            const checkedFilterContent = validateAndCheckFilterContent(field, filters[filterKey][i], fieldType, errorLists)
            if (!checkedFilterContent) continue
            filters[filterKey][i] = checkedFilterContent
          }
        } else if (typeof filters[filterKey] === 'string') {
          const checkedFilterContent = validateAndCheckFilterContent(field, filters[filterKey], fieldType, errorLists)
          if (!checkedFilterContent) continue
          filters[filterKey] = checkedFilterContent
        } else {
          return false
        }
      }
      if (errorLists.length) {
        throw Error(errorLists.join(', '))
      } else {
        return true
      }
    })
    .optional()
]

/**
 * Generate filter as sequelize query setting
 * based of object in query string (`req.query.f` or `req.query.filters`)
 *
 * Filter setting can be applied as models scope via `req.applySequelizeFilterScope` function which receive
 * Scoped model
 *
 * Each element of filter query string is consist of 3 parts, delimited by comma :
 *
 * `filters[fieldName,groupOperator]=operator,value`
 *
 * or
 *
 * `f[fieldName,groupOperator]=operator,value`
 */
module.exports.filter = (req, res, next) => {
  let filters = null
  let eagerFilters = null

  if (_.isPlainObject(req.query.filters)) {
    filters = {}
    eagerFilters = {}

    Object.keys(req.query.filters).forEach((filterKey) => {
      const filterKeyComps = filterKey.split(',')

      let field = filterKeyComps[0]
      const fieldComps = field.split('.')
      let fieldProperty = fieldComps[fieldComps.length - 1]
      fieldComps[fieldComps.length - 1] = fieldProperty.split('>')[0]
      field = fieldComps.join('.')
      fieldProperty = fieldProperty.replace(/[>]+/g, '.')

      let fieldGroup = (filterKeyComps[1] || 'and').toLowerCase()
      if (fieldGroup === 'or') {
        fieldGroup = Op.or
      } else {
        fieldGroup = Op.and
      }

      const filterContents = Array.isArray(req.query.filters[filterKey]) ? req.query.filters[filterKey] : [req.query.filters[filterKey]]

      filterContents.forEach((filterContent) => {
        const filterContentSplit = filterContent.split(',')
        const op = filterContentSplit[0]
        const value = filterContentSplit.length > 1 ? filterContentSplit.slice(1, filterContentSplit.length).join(',') : ''

        const targetFilters = field.indexOf('.') > 0 ? eagerFilters : filters

        const translatedOp = translateOp[op](fieldProperty, value)
        if (!targetFilters[field]) targetFilters[field] = {}
        if (targetFilters[field][fieldGroup]) {
          targetFilters[field][fieldGroup].push(translatedOp)
        } else {
          targetFilters[field][fieldGroup] = [translatedOp]
        }
      })
    })
  }

  req.applySequelizeFilterScope = (model) => {
    const eagerTraverse = (query, fields, where, level = 0) => {
      if (level === (fields.length - 1)) { // the end of traverse
        if (!_.isPlainObject(query)) { // convert direct model include to plain object
          query = { model: query }
        }
        if (!query.where) query.where = {}
        if (!query.where[Op.and]) query.where[Op.and] = []
        if (_.isPlainObject(query.where[Op.and])) {
          query.where[Op.and] = [query.where[Op.and]]
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
              if (!(level === (fields.length - 2)) && !Array.isArray(query.include[i].include)) { // nested include is not exist
                throw Error('invalid model in fields')
              } else {
                if (typeof query.required !== 'boolean' && level > 0) query.required = true
                eagerTraverse(query.include[i], fields, where, (level + 1))
              }
              return
            }
            if (i === (query.include.length - 1)) { // assertion if model really is included in scope
              throw Error('invalid model in fields')
            }
          }
        }
      }
    }

    if (!filters && !eagerFilters) return model

    if (model) {
      const prevScope = model._scope

      if (!prevScope.where) prevScope.where = {}
      if (!prevScope.where[Op.and]) prevScope.where[Op.and] = []
      if (!Array.isArray(prevScope.where[Op.and])) {
        prevScope.where[Op.and] = [prevScope.where[Op.and]]
      }
      Object.keys(filters).forEach(field => prevScope.where[Op.and].push(filters[field]))

      Object.keys(eagerFilters).forEach(field => eagerTraverse(prevScope, field.split('.'), eagerFilters[field]))

      return models[model.name].scope(prevScope)
    }
  }

  next()
}
