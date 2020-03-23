'use strict'

const msg = require('libs/msg')

const fraudDetectionApi = require('libs/fraudDetectionApi')
const errorMiddleware = require('middlewares/errorMiddleware')
const fraudDetectionValidator = require('validators/fraudDetectionValidator')

module.exports.getMerchantRules = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'READ'
    req.audit.event.entityName = 'fraudDetectionMerchantRule'
  }

  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  let resp
  if (req.params.merchantId) {
    resp = await fraudDetectionApi.getMerchantRule(req.params.merchantId)
  } else {
    resp = await fraudDetectionApi.getMerchantRules(req.query)
  }

  if (req.query.get_count) {
    msg.expressGetEntityResponse(
      res,
      resp.data,
      resp.meta.totalCount,
      resp.meta.page,
      req.query.per_page
    )
  } else {
    msg.expressGetEntityResponse(
      res,
      resp.data
    )
  }

  if (req.audit) {
    if (Array.isArray(resp.data)) {
      req.audit.event.entityIds =
        req.audit.event.entityIds.concat(resp.data.map(r => r.id_merchant))
    } else {
      req.audit.event.entityIds.push(resp.data.id_merchant)
    }
  }
}

module.exports.createMerchantRule = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'CREATE'
    req.audit.event.entityName = 'fraudDetectionMerchantRule'
  }

  const resp = await fraudDetectionApi.createMerchantRule(req.body)

  msg.expressCreateEntityResponse(res, resp.data)

  if (req.audit) {
    req.audit.event.entityIds.push(resp.data.id_merchant)
  }
}

module.exports.updateMerchantRule = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'UPDATE'
    req.audit.event.entityName = 'fraudDetectionMerchantRule'
  }

  const updated = true
  let found = false
  let findResp
  let resp

  try {
    findResp = await fraudDetectionApi.getMerchantRule(req.params.merchantId)
    if (findResp.data) found = true
  } catch (err) {}

  if (found) {
    resp = await fraudDetectionApi.updateMerchantRule(req.body, req.params.merchantId)
    if (req.audit) {
      req.audit.event.entityIds.push(req.params.merchantId)
      if (updated) {
        req.audit.event.entityBefore = findResp.data
        req.audit.event.entityAfter = resp.data
      }
    }
  }

  msg.expressUpdateEntityResponse(res, updated, resp.data, found)
}

module.exports.destroyMerchantRule = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'DELETE'
    req.audit.event.entityName = 'fraudDetectionMerchantRule'
  }

  const resp = await fraudDetectionApi.destroyMerchantRule(req.params.merchantId)
  msg.expressDeleteEntityResponse(res, resp)

  if (req.audit) {
    req.audit.event.entityIds.push(req.params.merchantId)
  }
}

module.exports.createMerchantRuleMiddlewares = [
  fraudDetectionValidator.bodyMerchantRuleUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.createMerchantRule
]

module.exports.updateMerchantRuleMiddlewares = [
  fraudDetectionValidator.bodyMerchantRuleUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateMerchantRule
]
