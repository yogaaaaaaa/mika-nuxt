'use strict'

const { query } = require('express-validator')

const models = require('../../models')
const helper = require('./helper')

/**
 * Validator for pagination and ordering middleware,
 * `validModels` is included as parameter to check if `req.query.order_by` is valid in model
 */
module.exports.paginationValidator = (validModels, bannedFields = null, acceptedFields = null) => [
  query('page').isNumeric().optional(),
  query('per_page').isNumeric().optional(),
  query('get_count').isBoolean().optional(),
  query('order')
    .isIn(['desc', 'asc'])
    .optional(),
  query('order_by')
    .custom(orderByField => {
      if (!helper.matchFieldPatterns(orderByField, bannedFields, acceptedFields)) return false
      return helper.validateFieldComponents(validModels, orderByField.split('.'))
    })
    .optional()
]

/**
 * Generate sequelize query setting for pagination and order.
 * Apply to existing scoped models via `req.applySequelizePaginationScope` function
 */
module.exports.pagination = (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  req.query.get_count = req.query.get_count || false

  req.query.order = req.query.order || 'desc'
  req.query.order_by = req.query.order_by || 'createdAt'

  const fieldComponents = req.query.order_by.split('.')
  const orderBy = fieldComponents.map((fieldComponent) => {
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
          orderBy,
          ['id', req.query.order] // default order
        ]
      }))
    }
  }

  req.applySequelizeOrderScope = (model) => {
    if (model) {
      return models[model.name].scope(Object.assign(model._scope, {
        order: [
          orderBy
        ]
      }))
    }
  }

  next()
}
