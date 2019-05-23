'use strict'

const msg = require('../libs/msg')
const trxManager = require('../libs/trxManager')

const { body } = require('express-validator/check')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryMiddleware = require('../middlewares/queryMiddleware')

const models = require('../models')

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
 * Create new transaction by agent
 * (via `req.auth.agentId`)
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
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_REDIRECTED,
        createTrxResult
      )
      return
    }

    if (createTrxResult.followUpType) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_PENDING_NEED_FOLLOW_UP,
        createTrxResult
      )
      return
    }

    if (createTrxResult.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS,
        createTrxResult
      )
      return
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED,
      createTrxResult
    )
  } catch (err) {
    let msgType = trxManager.errorToMsgTypes(err)
    if (msgType) {
      msg.expressResponse(
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
    msg.expressGetEntityResponse(
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
      msg.expressGetEntityResponse(
        res,
        transactions.rows,
        transactions.count,
        req
      )
    } else {
      msg.expressGetEntityResponse(
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
    msg.expressGetEntityResponse(
      res,
      await models.transaction
        .scope({ method: [ 'merchantStaff', req.auth.merchantStaffId ] })
        .findOne(query)
    )
  } else {
    let scopedTransaction =
      req.applySequelizeFiltersScope(
        req.applySequelizePaginationScope(
          models.transaction
            .scope({ method: [ 'merchantStaff', req.auth.merchantStaffId, req.params.outletId ] })
        )
      )
    if (req.query.get_count) {
      let transactions = await scopedTransaction.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        transactions.rows,
        transactions.count,
        req
      )
    } else {
      msg.expressGetEntityResponse(
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
module.exports.getMerchantStaffAcquirerTransactionStats = async (req, res, next) => {
  let scopedTransaction = req.applySequelizeFiltersScope(
    models.transaction.scope(
      { method: [ 'merchantStaffAcquirerTransactionStats', req.auth.merchantStaffId ] }
    )
  )

  msg.expressGetEntityResponse(
    res,
    (await scopedTransaction.findAll()).map(transactionStatistic => {
      transactionStatistic = transactionStatistic.toJSON()
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
      req.applySequelizePaginationScope(
        models.transaction.scope(
          { method: [ 'merchantStaffTransactionTimeGroupCount', req.auth.merchantStaffId ] }
        )
      )
    )
  )

  msg.expressGetEntityResponse(
    res,
    (await scopedTransaction.findAll()).map(transactionCount => {
      transactionCount = transactionCount.toJSON()
      transactionCount.agent = undefined
      return transactionCount
    })
  )
}

module.exports.createTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  module.exports.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  module.exports.createTransaction
]

module.exports.getAgentTransactionsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator(['transaction']),
  queryMiddleware.filtersToSequelizeValidator(
    ['transaction', 'acquirer', 'acquirerType', 'acquirerConfig'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  exports.getAgentTransactions
]

module.exports.getMerchantStaffTransactionsMiddlewares = [
  queryMiddleware.paginationToSequelizeValidator(['transaction']),
  queryMiddleware.filtersToSequelizeValidator(
    ['transaction', 'agent', 'acquirer', 'acquirer', 'acquirerType', 'acquirerConfig'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  exports.getMerchantStaffTransactions
]

module.exports.getMerchantStaffAcquirerTransactionStatsMiddlewares = [
  queryMiddleware.filtersToSequelizeValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.filtersToSequelize,
  exports.getMerchantStaffAcquirerTransactionStats
]

module.exports.getMerchantStaffTransactionTimeGroupCountMiddlewares = [
  queryMiddleware.timeGroupToSequelizeValidator('transaction'),
  queryMiddleware.paginationToSequelizeValidator(
    ['transaction'],
    ['*archivedAt']
  ),
  queryMiddleware.filtersToSequelizeValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType', 'acquirerConfig'],
    ['*archivedAt']),
  errorMiddleware.validatorErrorHandler,
  queryMiddleware.paginationToSequelize,
  queryMiddleware.filtersToSequelize,
  queryMiddleware.timeGroupToSequelize,
  exports.getMerchantStaffTransactionTimeGroupCount
]
