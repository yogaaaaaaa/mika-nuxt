'use strict'

const msg = require('../libs/msg')
const trxManager = require('../libs/trxManager')
const models = require('../models')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')

const transactionValidator = require('../validators/transactionValidator')

module.exports.createTransaction = async (req, res, next) => {
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
}

module.exports.cancelTransaction = async (req, res, next) => {
  const trxCancelResult = await trxManager.cancel(req.params.transactionId)
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS_TRANSACTION_CANCELED,
    trxCancelResult
  )
}

module.exports.refundTransaction = async (req, res, next) => {
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
}

module.exports.changeAgentTransactionStatus = async (req, res, next) => {
  const trxForceUpdateResult = await trxManager.forceStatusUpdate(
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
}

module.exports.getAgentTransactions = async (req, res, next) => {
  const query = {
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
    const scopedTransaction =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          models.transaction.scope('agent')
        )
      )
    if (req.query.get_count) {
      const transactions = await scopedTransaction.findAndCountAll(query)
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
  const query = { where: {} }

  if (req.params.transactionId) query.where.id = req.params.transactionId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.transactionId || req.params.idAlias) {
    msg.expressGetEntityResponse(
      res,
      await models.transaction
        .scope({ method: ['merchantStaff', req.auth.merchantStaffId] })
        .findOne(query)
    )
  } else {
    const scopedTransaction =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          models.transaction
            .scope({ method: ['merchantStaff', req.auth.merchantStaffId, req.params.outletId] })
        )
      )
    if (req.query.get_count) {
      const transactions = await scopedTransaction.findAndCountAll(query)
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

module.exports.getAcquirerStaffTransactions = async (req, res, next) => {
  const query = { where: {} }

  if (req.params.transactionId) query.where.id = req.params.transactionId
  if (req.params.idAlias) query.where.idAlias = req.params.idAlias

  if (req.params.transactionId || req.params.idAlias) {
    msg.expressGetEntityResponse(
      res,
      await models.transaction
        .scope({ method: ['acquirerStaff', req.auth.acquirerCompanyId] })
        .findOne(query)
    )
  } else {
    const scopedTransaction = req.applySequelizeFilterScope(
      req.applySequelizePaginationScope(
        models.transaction.scope({
          method: ['acquirerStaff', req.auth.acquirerCompanyId]
        })
      )
    )
    if (req.query.get_count) {
      const transactions = await scopedTransaction.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        transactions.rows,
        transactions.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(res, await scopedTransaction.findAll(query))
    }
  }
}

module.exports.getMerchantStaffAcquirerTransactionStats = async (req, res, next) => {
  const scopedTransaction = req.applySequelizeFilterScope(
    models.transaction.scope(
      { method: ['merchantStaffAcquirerTransactionStats', req.auth.merchantStaffId] }
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
  const scopedTransaction =
  req.applySequelizeOrderScope(
    req.applySequelizeFilterScope(
      req.applySequelizeTimeGroupScope(
        models.transaction.scope(
          { method: ['merchantStaffTransactionTimeGroupCount', req.auth.merchantStaffId] }
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
  const query = {
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
      const transactions = await scopedTransaction.findAndCountAll(query)
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
  transactionValidator.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  exports.createTransaction
]

module.exports.cancelTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.cancelTransaction
]

module.exports.refundTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  transactionValidator.refundTransactionValidator,
  exports.refundTransaction
]

module.exports.changeAgentTransactionStatusMiddlewares = [
  transactionValidator.changeAgentTransactionStatusValidator,
  errorMiddleware.validatorErrorHandler,
  exports.changeAgentTransactionStatus
]

module.exports.getAgentTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'acquirer', 'acquirerType', 'acquirerConfig']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getAgentTransactions
]

module.exports.getMerchantStaffTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'outlet', 'acquirer', 'acquirerType', 'acquirerConfig']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getMerchantStaffTransactions
]

module.exports.getMerchantStaffAcquirerTransactionStatsMiddlewares = [
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.filter,
  exports.getMerchantStaffAcquirerTransactionStats
]

module.exports.getMerchantStaffTransactionTimeGroupCountMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.timeGroupValidator('transaction'),
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType', 'acquirerConfig']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.timeGroup,
  exports.getMerchantStaffTransactionTimeGroupCount
]

module.exports.getAcquirerStaffTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    [
      'transaction',
      'agent',
      'outlet',
      'acquirer',
      'acquirerType',
      'acquirerConfig'
    ]
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getAcquirerStaffTransactions
]

module.exports.getTransactionsMiddlewares = [
  queryToSequelizeMiddleware.paginationValidator(['transaction']),
  queryToSequelizeMiddleware.filterValidator(
    [
      'transaction',
      'acquirer',
      'acquirerType',
      'agent',
      'outlet',
      'merchant'
    ]
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  exports.getTransactions
]
