'use strict'

const { query } = require('express-validator')

const models = require('../../models')

module.exports.commonValidator = [
  query('archived').isBoolean().optional(),
  query('deep_archived').isBoolean().optional() // unused for now
]

module.exports.common = (req, res, next) => {
  req.applySequelizeCommonScope = (model) => {
    if (model) {
      let prevScope = model._scope
      if (req.query.archived) prevScope.paranoid = false

      return models[model.name].scope(prevScope)
    }
  }
  next()
}
