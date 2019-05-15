'use strict'

const msg = require('../helpers/msg')
const trxManager = require('../helpers/trxManager')

const { body } = require('express-validator/check')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')
const Sequelize = models.Sequelize

/**
 * Validator middleware(s) for createTransaction
 */
module.exports.createTransactionValidator = [
  body('amount').isNumeric(),
  body('acquirerId').exists(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('locationLong').isNumeric().optional(),
  body('locationLat').isNumeric().optional(),
  body('flags').isArray().optional()
]

/**
 * Create new transaction by agent (via `req.auth.userType`)
 */
module.exports.createTransaction = async (req, res, next) => {
  try {
    const createTrxResult = await trxManager.create(
      {
        agentId: req.auth.agentId,
        terminalId: req.auth.terminalId,
        amount: req.body.amount,
        acquirerId: req.body.acquirerId,
        ipAddress: req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip,
        locationLat: req.body.locationLat,
        locationLong: req.body.locationLong,
        userToken: req.body.userToken,
        userTokenType: req.body.userTokenType
      },
      {
        flags: req.body.flags
      }
    )

    if (createTrxResult.redirectTo) {
      msg.expressCreateResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_REDIRECTED,
        createTrxResult
      )
      return
    }

    if (createTrxResult.followUpType) {
      msg.expressCreateResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_PENDING_NEED_FOLLOW_UP,
        createTrxResult
      )
      return
    }

    if (createTrxResult.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      msg.expressCreateResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS,
        createTrxResult
      )
      return
    }

    msg.expressCreateResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED,
      createTrxResult
    )
  } catch (err) {
    let msgType = trxManager.errorToMsgTypes(err)
    if (msgType) {
      msg.expressCreateResponse(
        res,
        msgType
      )
    } else {
      console.error(err)
      throw Error('Cannot handle createTransaction error')
    }
  }
}

/**
 * Get one or many transactions owned by agent
 * (via `req.auth.agentId`)
 */
module.exports.getAgentTransactions = async (req, res, next) => {
  let query = {
    where: {
      agentId: req.auth.agentId
    }
  }

  if (req.params.transactionId) query.where.id = req.params.transactionId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.transactionId || req.params.idAlias) {
    msg.expressCreateEntityResponse(
      res,
      await models.transaction.scope('agent').findOne(query)
    )
  } else {
    let scopedTransaction =
      req.applySequelizeFiltersScope(
        req.applySequelizePaginationScope(
          models.transaction.scope('agent')
        )
      )
    if (req.query.get_count) {
      let transactions = await scopedTransaction.findAndCountAll(query)
      msg.expressCreateEntityResponse(
        res,
        transactions.rows,
        transactions.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressCreateEntityResponse(
        res,
        await scopedTransaction.findAll(query)
      )
    }
  }
}

/**
 * Get one or many transactions owned by merchant staff
 * (via `req.auth.merchantStaffId`)
 */
module.exports.getMerchantStaffTransactions = async (req, res, next) => {
  let query = { where: {} }

  if (req.params.transactionId) query.where.id = req.params.transactionId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.transactionId || req.params.idAlias) {
    msg.expressCreateEntityResponse(
      res,
      await models.transaction
        .scope({ method: [ 'merchantStaff', req.auth.merchantStaffId ] })
        .findOne(query)
    )
  } else {
    let scopedTransaction =
      req.applySequelizeFiltersScope(
        req.applySequelizePaginationScope(
          models
            .scope({ method: [ 'merchantStaff', req.auth.merchantStaffId, req.params.outletId ] })
        )
      )
    if (req.query.get_count) {
      let transactions = await scopedTransaction.findAndCountAll(query)
      msg.expressCreateEntityResponse(
        res,
        transactions.rows,
        transactions.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressCreateEntityResponse(
        res,
        await scopedTransaction.findAll(query)
      )
    }
  }
}

/**
 * Get acquirer transaction statistics owned by merchant staff
 * (via `req.auth.merchantStaffId`)
 */
module.exports.getMerchantStaffAcquererTransactionStats = async (req, res, next) => {
  let scopedTransaction = req.applySequelizeFiltersScope(
    models.transaction.scope(
      { method: [ 'merchantStaffAcquirerTransactionStats', req.auth.merchantStaffId ] }
    )
  )

  let transactionStatistics = await scopedTransaction.findAll()

  msg.expressCreateEntityResponse(
    res,
    transactionStatistics.map(transactionStatistic => {
      transactionStatistic.agent = undefined
      return transactionStatistic
    })
  )
}

/**
 * Get acquirer transaction time group count owned by merchant staff
 * (via `req.auth.merchantStaffId`)
 */
module.exports.getMerchantStaffTransactionTimeGroupCount = async (req, res, next) => {
  let scopedTransaction = req.applySequelizeFiltersScope(
    req.applySequelizeTimeGroupScope(
      models.transaction.scope(
        { method: [ 'merchantStaffTransactionTimeGroupCount', req.auth.merchantStaffId ] }
      )
    )
  )
  msg.expressCreateEntityResponse(
    res,
    (await scopedTransaction.findAll()).map(transactionCount => {
      transactionCount.agent = undefined
      return transactionCount
    })
  )
}

/**
 * All Middlewares for createTransaction
 */
module.exports.createTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  module.exports.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  module.exports.createTransaction
]

/**
 * All Middlewares for getAgentTransactions
 */
module.exports.getAgentTransactionsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator(['transaction']),
  queryMiddleware.filtersToSequelizeValidator(['transaction', 'acquirer', 'acquirerType', 'acquirerConfig']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  exports.getAgentTransactions
]

/**
 * All Middlewares for getMerchantStaffTransactions
 */
module.exports.getMerchantStaffTransactionsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator(['transaction']),
  queryMiddleware.filtersToSequelizeValidator(['transaction', 'agent', 'acquirer', 'acquirerType']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  exports.getMerchantStaffTransactions
]

/**
 * All Middlewares for getMerchantStaffAcquirerTransactionStats
 */
module.exports.getMerchantStaffAcquererTransactionStatsMiddlewares = [
  queryMiddleware.filtersToSequelizeValidator(['transaction', 'agent', 'acquirer', 'acquirerType']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.filtersToSequelize,
  exports.getMerchantStaffAcquererTransactionStats
]

/**
 * All Middlewares for getMerchantStaffTransactionTimeGroupCount
 */
module.exports.getMerchantStaffTransactionTimeGroupCountMiddlewares = [
  queryMiddleware.timeGroupToSequelizeValidator('transaction'),
  queryMiddleware.filtersToSequelizeValidator(['transaction', 'agent', 'acquirer', 'acquirerType']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.filtersToSequelize,
  queryMiddleware.timeGroupToSequelize,
  exports.getMerchantStaffTransactionTimeGroupCount
]
