'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const msg = require('../libs/msg')
const trxManager = require('../libs/trxManager')
const models = require('../models')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')

module.exports.createTransactionValidator = [
  body('amount').isNumeric(),
  body('acquirerId').exists(),
  body('userToken').optional(),
  body('userTokenType').isString().optional(),
  body('locationLong').isNumeric().optional({ nullable: true }),
  body('locationLat').isNumeric().optional({ nullable: true }),
  body('flags').isArray().optional()
]

module.exports.changeAgentTransactionStatusValidator = [
  body('transactionId').exists(),
  body('status').isIn(_.values(trxManager.transactionStatuses))
]

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
      throw err
    }
  }
}

module.exports.changeAgentTransactionStatus = async (req, res, next) => {
  let transaction = await trxManager.forceStatus(
    req.body.transactionId,
    req.body.status,
    req.auth.agentId
  )

  if (transaction) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_BAD_REQUEST
    )
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
    ['transaction', 'agent', 'acquirer', 'acquirer', 'acquirerType', 'acquirerConfig'],
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
