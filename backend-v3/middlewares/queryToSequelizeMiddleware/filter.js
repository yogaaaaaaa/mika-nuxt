'use strict'

const _ = require('lodash')
const { query } = require('express-validator')

const helper = require('./helper')
const models = require('../../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

const translateOp = {
  eq: (field, val) => ({
    [field]: val
  }),
  neq: (field, val) => ({
    [field]: { [Op.ne]: val }
  }),
  eqtrue: (field, val) => ({
    [field]: true
  }),
  eqfalse: (field, val) => ({
    [field]: true
  }),
  eqnull: (field, val) => ({
    [field]: null
  }),
  neqnull: (field, val) => ({
    [field]: { [Op.ne]: null }
  }),
  gt: (field, val) => ({
    [field]: { [Op.gt]: val }
  }),
  gte: (field, val) => ({
    [field]: { [Op.gte]: val }
  }),
  lt: (field, val) => ({
    [field]: { [Op.lt]: val }
  }),
  lte: (field, val) => ({
    [field]: { [Op.lte]: val }
  }),
  like: (field, val) => ({
    [field]: { [Op.like]: val }
  })
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
      if (!_.isPlainObject(filters)) return false
      for (const filterKey of Object.keys(filters)) {
        const field = filterKey.split(',')[0]
        if (!helper.matchFieldPatterns(field, bannedFields, acceptedFields)) return false
        if (!helper.validateFieldComponents(validModels, field.split('.'))) return false

        const validOps = Object.keys(translateOp)
        if (Array.isArray(filters[filterKey])) {
          for (const filterContent of filters[filterKey]) {
            if (typeof filterContent !== 'string') return false
            if (!validOps.includes(filterContent.split(',')[0])) return false
          }
        } else if (typeof filters[filterKey] === 'string') {
          if (!validOps.includes(filters[filterKey].split(',')[0])) return false
        } else {
          return false
        }
      }
      return true
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
      const filterKeySplit = filterKey.split(',')

      const field = filterKeySplit[0]
      const fieldProperty = field.split('.').pop()
      let groupOp = (filterKeySplit[1] || 'and').toLowerCase()
      if (groupOp === 'or') {
        groupOp = Op.or
      } else {
        groupOp = Op.and
      }

      const filterContents = Array.isArray(req.query.filters[filterKey]) ? req.query.filters[filterKey] : [req.query.filters[filterKey]]

      filterContents.forEach((filterContent) => {
        const filterContentSplit = filterContent.split(',')
        const op = filterContentSplit[0]
        const value = filterContentSplit.length > 1 ? filterContentSplit.slice(1, filterContentSplit.length).join(',') : ''

        const targetFilters = field.indexOf('.') > 0 ? eagerFilters : filters

        const translatedOp = translateOp[op](fieldProperty, value)
        if (!targetFilters[field]) targetFilters[field] = {}
        if (targetFilters[field][groupOp]) {
          targetFilters[field][groupOp].push(translatedOp)
        } else {
          targetFilters[field][groupOp] = [translatedOp]
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
      if (_.isPlainObject(prevScope.where[Op.and])) {
        prevScope.where[Op.and] = [prevScope.where[Op.and]]
      }
      Object.keys(filters).forEach(field => prevScope.where[Op.and].push(filters[field]))

      Object.keys(eagerFilters).forEach(field => eagerTraverse(prevScope, field.split('.'), eagerFilters[field]))

      return models[model.name].scope(prevScope)
    }
  }

  next()
}
