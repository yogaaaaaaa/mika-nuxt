'use strict'

const msg = require('libs/msg')

const fraudDetectionApi = require('libs/fraudDetectionApi')
const errorMiddleware = require('middlewares/errorMiddleware')
const fraudDetectionValidator = require('validators/fraudDetectionValidator')

module.exports.getRules = async (req, res, next) => {
  let rules = null

  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  if (req.params.ruleId) {
    rules = await fraudDetectionApi.getRule(req.params.ruleId)
  } else {
    rules = await fraudDetectionApi.getRules(req.query)
  }

  if (req.query.get_count) {
    msg.expressGetEntityResponse(
      res,
      rules.data,
      rules.meta.totalCount,
      rules.meta.page,
      req.query.per_page
    )
  } else {
    msg.expressGetEntityResponse(
      res,
      rules.data
    )
  }
}

module.exports.createRule = async (req, res, next) => {
  const body = req.body
  const resp = await fraudDetectionApi.createRule(body)
  msg.expressCreateEntityResponse(res, resp.data)
}

module.exports.updateRule = async (req, res, next) => {
  const id = req.params.ruleId
  const body = req.body
  const response = await fraudDetectionApi.updateRule(body, id)
  const updated = true
  const found = true
  msg.expressUpdateEntityResponse(res, updated, response.data, found)
}

module.exports.destroyRule = async (req, res, next) => {
  const id = req.params.ruleId
  const response = await fraudDetectionApi.destroyRule(id)
  msg.expressDeleteEntityResponse(res, response)
}

module.exports.createRuleMiddlewares = [
  fraudDetectionValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createRule
]

module.exports.updateRuleMiddlewares = [
  fraudDetectionValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.updateRule
]
