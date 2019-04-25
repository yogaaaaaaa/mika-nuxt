'use strict'

const models = require('../models')
const extApiObject = require('../helpers/extApiObject')
const msgFactory = require('../helpers/msgFactory')
const trxManager = require('../helpers/trxManager')

const queryMiddleware = require('../middlewares/queryMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const { body, query } = require('express-validator/check')

const extApiTrxCallback = require('../helpers/extApiTrxCallback')

module.exports.getRoot = async (req, res, next) => {
  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS,
    'MIKA Public API'
  )
}

module.exports.createTransactionValidator = [
  body('agentId').exists(),
  body('paymentProviderId').exists(),
  body('amount').isNumeric(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('webhookUrl').isURL({
    protocols: ['https', 'http'],
    require_tld: false
  }).optional()
]

module.exports.createTransaction = async (req, res, next) => {
  if (!await models.agent.scope(
    'onlyId',
    { method: ['validPartner', req.auth.partnerId] }
  ).findByPk(req.body.agentId)) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_ERROR_TRANSACTION_INVALID_AGENT
    )
    return
  }

  try {
    let createTrxResult = await trxManager.create({
      agentId: req.body.agentId,
      paymentProviderId: req.body.paymentProviderId,
      amount: req.body.amount,
      ipAddress: req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip,
      userToken: req.body.userToken,
      userTokenType: req.body.userTokenType
    })

    if (!createTrxResult.transactionId) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_TRANSACTION_UNSUPPORTED_PAYMENT_PROVIDER
      )
      return
    }

    if (req.body.webhookUrl) {
      await extApiTrxCallback.addCallback(
        req.auth.idKey,
        req.body.webhookUrl,
        createTrxResult.transactionId)
    }

    let mappedTransaction = extApiObject.mapCreatedTransaction(createTrxResult)

    if (createTrxResult.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS,
        mappedTransaction
      )
      return
    }

    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED,
      mappedTransaction
    )
  } catch (err) {
    let msgType = trxManager.errorToMsgTypes(err)
    if (msgType) {
      msgFactory.expressCreateResponse(
        res,
        msgType
      )
    } else {
      throw err
    }
  }
}

module.exports.createTransactionMiddlewares = [
  exports.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  exports.createTransaction
]

module.exports.getTransactionsValidator = [
  query('order_by').custom((orderBy, { req }) => {
    if ([
      'createdAt',
      'updatedAt',
      'transactionStatus',
      'amount',
      'paymentProviderId'
    ].includes(orderBy)) {
      if (orderBy === 'transactionStatus') {
        req.query.order_by = 'status'
      }
      return true
    } else {
      delete req.query.order_by
      return false
    }
  }).optional()
]

module.exports.getTransactions = async (req, res, next) => {
  let query = {
    where: {}
  }
  req.applyPaginationSequelize(query)

  if (req.params.transactionId) {
    query.where.id = req.params.transactionId
    let transaction = await models.transaction.scope({ method: ['partner', req.auth.partnerId] }).findOne(query)
    msgFactory.expressCreateResponse(
      res,
      transaction
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_SINGLE_ENTITY_NOT_FOUND,
      extApiObject.mapTransaction(transaction) || undefined
    )
  } else {
    let transactions = null
    if (req.params.agentId) {
      query.where.agentId = req.params.agentId
      transactions = await models.transaction
        .scope({ method: [ 'partner', req.auth.partnerId ] })
        .findAll(query)
    } else if (req.params.merchantId) {
      transactions = await models.transaction
        .scope({ method: [ 'partner', req.auth.partnerId, req.params.merchantId ] })
        .findAll(query)
    } else {
      transactions = await models.transaction
        .scope({ method: [ 'partner', req.auth.partnerId ] })
        .findAll(query)
    }

    msgFactory.expressCreateResponse(
      res,
      transactions.length > 0
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_NO_ENTITY,
      transactions.map((transaction) => extApiObject.mapTransaction(transaction))
    )
  }
}

module.exports.getTransactionsMiddlewares = [
  exports.getTransactionsValidator,
  queryMiddleware.paginationToSequelizeValidator('transaction'),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  exports.getTransactions
]

module.exports.getAgentsValidator = [
  query('order_by').custom((orderBy, { req }) => {
    if ([
      'agentId',
      'agentName',
      'createdAt',
      'updatedAt',
      'paymentProviderId'
    ].includes(orderBy)) {
      if (orderBy === 'transactionStatus') {
        req.query.order_by = 'status'
      } else if (orderBy === 'agentId') {
        req.query.order_by = 'id'
      } else if (orderBy === 'agentName') {
        req.query.order_by = 'name'
      }
      return true
    } else {
      delete req.query.order_by
      return false
    }
  }).optional()
]

module.exports.getAgents = async (req, res, next) => {
  let query = {
    where: {}
  }
  req.applyPaginationSequelize(query)
  if (req.params.agentId) {
    query.where.id = req.params.agentId
    let agent = await models.agent
      .scope({ method: ['partner', req.auth.partnerId] })
      .findOne(query)
    msgFactory.expressCreateResponse(
      res,
      agent
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_SINGLE_ENTITY_NOT_FOUND,
      extApiObject.mapAgent(agent) || undefined
    )
  } else {
    let agents = null
    if (req.params.merchantId) {
      agents = await models.agent
        .scope({ method: [ 'partner', req.auth.partnerId, req.params.merchantId ] })
        .findAll(query)
    } else {
      agents = await models.agent
        .scope({ method: ['partner', req.auth.partnerId] })
        .findAll(query)
    }
    msgFactory.expressCreateResponse(
      res,
      agents.length > 0
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_NO_ENTITY,
      agents.map((agent) => extApiObject.mapAgent(agent))
    )
  }
}

module.exports.getAgentsMiddlewares = [
  exports.getAgentsValidator,
  queryMiddleware.paginationToSequelizeValidator('agent'),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  exports.getAgents
]

module.exports.getMerchantsValidator = [
  query('order_by').custom((orderBy, { req }) => {
    if ([
      'merchantId',
      'merchantName',
      'createdAt',
      'updatedAt'
    ].includes(orderBy)) {
      if (orderBy === 'merchantId') {
        req.query.order_by = 'id'
      } else if (orderBy === 'merchantName') {
        req.query.order_by = 'name'
      }
      return true
    } else {
      delete req.query.order_by
      return false
    }
  }).optional()
]

module.exports.getMerchants = async (req, res, next) => {
  let query = {
    where: {}
  }
  req.applyPaginationSequelize(query)
  if (req.params.merchantId) {
    query.where.id = req.params.merchantId
    let merchant = await models.merchant
      .scope({ method: ['partner', req.auth.partnerId] })
      .findOne(query)

    msgFactory.expressCreateResponse(
      res,
      merchant
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_SINGLE_ENTITY_NOT_FOUND,
      extApiObject.mapMerchant(merchant) || undefined
    )
  } else {
    let merchants = await models.merchant
      .scope({ method: ['partner', req.auth.partnerId] })
      .findAll(query)

    msgFactory.expressCreateResponse(
      res,
      merchants.length > 0
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_NO_ENTITY,
      merchants.map((merchant) => extApiObject.mapMerchant(merchant))
    )
  }
}
module.exports.getMerchantsMiddlewares = [
  exports.getMerchantsValidator,
  queryMiddleware.paginationToSequelizeValidator('merchant'),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  exports.getMerchants
]

module.exports.debugSetTransactionStatus = async (req, res, next) => {
  if (req.params.transactionId && req.params.transactionStatus) {
    if (models.transaction.scope({
      method: ['validPartner', req.auth.partnerId]
    }).findByPk(req.params.transactionId)) {
      if (await trxManager.forceStatus(req.params.transactionId, req.params.transactionStatus)) {
        msgFactory.expressCreateResponse(
          res,
          msgFactory.msgTypes.MSG_SUCCESS
        )
        return
      }
    }
  }

  res.status(msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST
    )
  )
}
