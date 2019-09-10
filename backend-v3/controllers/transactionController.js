'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const msg = require('../libs/msg')
const trxManager = require('../libs/trxManager')
const models = require('../models')

const trxManagerError = require('./helpers/trxManagerError')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')

const amountPositiveIntegerValidator = (value) => {
  value = parseFloat(value)
  if (Number.isInteger(value)) {
    if (value > 0 && value <= Number.MAX_SAFE_INTEGER) return true
  }
  return false
}

module.exports.createTransactionValidator = [
  body('amount').custom(amountPositiveIntegerValidator),
  body('acquirerId').exists(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('locationLong').isNumeric().optional({ nullable: true }),
  body('locationLat').isNumeric().optional({ nullable: true }),
  body('flags').isArray().optional()
]

module.exports.refundTransactionValidator = [
  body('amount').custom(amountPositiveIntegerValidator).optional({ nullable: true }),
  body('reason').isString().optional({ nullable: true })
]

module.exports.changeAgentTransactionStatusValidator = [
  body('transactionId').exists(),
  body('status').isIn(_.values(trxManager.transactionStatuses)),
  body('syncWithAcquirerHost').isBoolean().optional()
]

module.exports.createTransaction = async (req, res, next) => {
  try {
    const trxCreateResult = await trxManager.create(
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

    if (trxCreateResult.redirectTo) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_REDIRECTED,
        trxCreateResult
      )
      return
    }

    if (trxCreateResult.followUpType) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_NEED_FOLLOW_UP,
        trxCreateResult
      )
      return
    }

    if (trxCreateResult.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS,
        trxCreateResult
      )
      return
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED,
      trxCreateResult
    )
  } catch (err) {
    trxManagerError.handleError(err, res)
  }
}

module.exports.cancelTransaction = async (req, res, next) => {
  try {
    const trxCancelResult = await trxManager.cancel(req.params.transactionId)
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_CANCELED,
      trxCancelResult
    )
  } catch (err) {
    trxManagerError.handleError(err, res)
  }
}

module.exports.refundTransaction = async (req, res, next) => {
  try {
    const trxRefundResult = await trxManager.refund({
      transactionId: req.params.transactionId,
      amount: req.body.amount,
      reason: req.body.reason
    })

    if (trxRefundResult.transactionStatus === trxManager.transactionStatuses.REFUNDED_PARTIAL) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS_TRANSACTION_PARTIALLY_REFUNDED,
        trxRefundResult
      )
      return
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_REFUNDED,
      trxRefundResult
    )
  } catch (err) {
    trxManagerError.handleError(err, res)
  }
}

module.exports.changeAgentTransactionStatus = async (req, res, next) => {
  try {
    let trxForceUpdateResult = await trxManager.forceStatusUpdate(
      req.body.transactionId,
      req.body.status,
      {
        agentId: req.auth.agentId,
        syncWithAcquirerHost: req.body.syncWithAcquirerHost
      }
    )

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS,
      trxForceUpdateResult
    )
  } catch (err) {
    trxManagerError.handleError(err, res)
  }
}

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
      req.applySequelizeFilterScope(
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
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedTransaction.findAll(query)
      )
    }
  }
}

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
      req.applySequelizeFilterScope(
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
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedTransaction.findAll(query)
      )
    }
  }
}

module.exports.getMerchantStaffAcquirerTransactionStats = async (req, res, next) => {
  let scopedTransaction = req.applySequelizeFilterScope(
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

module.exports.getMerchantStaffTransactionTimeGroupCount = async (req, res, next) => {
  let scopedTransaction =
  req.applySequelizeOrderScope(
    req.applySequelizeFilterScope(
      req.applySequelizeTimeGroupScope(
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

module.exports.getTransactions = async (req, res, next) => {
  let query = {
    where: {}
  }

  let scopedTransaction = models.transaction.scope('admin')

  if (req.params.transactionId) query.where.id = req.params.transactionId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.transactionId || req.params.idAlias) {
    msg.expressGetEntityResponse(
      res,
      await scopedTransaction.findOne(query)
    )
  } else {
    scopedTransaction =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedTransaction
        )
      )
    if (req.query.get_count) {
      let transactions = await scopedTransaction.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        transactions.rows,
        transactions.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedTransaction.findAll(query)
      )
    }
  }
}

module.exports.createTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  exports.createTransaction
]

module.exports.cancelTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.cancelTransaction
]

module.exports.refundTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.refundTransactionValidator,
  exports.refundTransaction
]

module.exports.changeAgentTransactionStatusMiddlewares = [
  exports.changeAgentTransactionStatusValidator,
  errorMiddleware.validatorErrorHandler,
  exports.changeAgentTransactionStatus
]

module.exports.getAgentTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'acquirer', 'acquirerType', 'acquirerConfig'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getAgentTransactions
]

module.exports.getMerchantStaffTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'outlet', 'acquirer', 'acquirerType', 'acquirerConfig'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getMerchantStaffTransactions
]

module.exports.getMerchantStaffAcquirerTransactionStatsMiddlewares = [
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.filter,
  exports.getMerchantStaffAcquirerTransactionStats
]

module.exports.getMerchantStaffTransactionTimeGroupCountMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.timeGroupValidator('transaction'),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType', 'acquirerConfig'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.timeGroup,
  exports.getMerchantStaffTransactionTimeGroupCount
]

module.exports.getTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'acquirer', 'acquirerType', 'agent', 'outlet'],
    ['*archivedAt']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getTransactions
]
