'use strict'

const _ = require('lodash')
const { query } = require('express-validator')

const models = require('../../models')

module.exports.commonValidator = [
  query('archived').isBoolean().optional()
]

module.exports.common = (req, res, next) => {
  req.applySequelizeCommonScope = (model) => {
    if (model) {
      const traverseQuery = (query) => {
        query.paranoid = false
        if (Array.isArray(query.include)) {
          for (let i = 0; i < query.include.length; i++) {
            if (!_.isPlainObject(query.include[i])) {
              query.include[i] = { model: query.include[i] } // convert direct model include to plain object
            }
            traverseQuery(query.include[i])
          }
        }
      }

      const prevScope = model._scope
      if (req.query.archived) {
        traverseQuery(prevScope)
      }

      return models[model.name].scope(prevScope)
    }
  }
  next()
}
