'use strict'

const msg = require('../libs/msg')
const trxManager = require('libs/trxManager')
const models = require('../models')

const cipherboxMiddleware = require('middlewares/cipherboxMiddleware')
const errorMiddleware = require('middlewares/errorMiddleware')
const queryToSequelizeMiddleware = require('middlewares/queryToSequelizeMiddleware')
const crudGenerator = require('./helpers/crudGenerator')

const transactionValidator = require('validators/transactionValidator')

const isEnvProduction = process.env.NODE_ENV === 'production'

module.exports.createTransaction = async (req, res, next) => {
  const trxCreateResult = await trxManager.create(
    {
      agentId: req.auth.agentId,
      transaction: {
        agentId: req.auth.agentId,
        terminalId: req.auth.terminalId,
        acquirerId: req.body.acquirerId,
        amount: req.body.amount,

        agentOrderReference: req.body.agentOrderReference,
        orderReference: req.body.orderReference,

        ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip,

        locationLat: req.body.locationLat,
        locationLong: req.body.locationLong,

        userToken: req.body.userToken,
        userTokenType: req.body.userTokenType,

        properties: req.body.properties,
        references: req.body.references
      },
      ctxOptions: {
        flags: req.body.flags,
        debug: isEnvProduction ? undefined : req.body.debug
      }
    }
  )
  trxCreateResult.transaction = await models.transaction
    .scope('agent')
    .findByPk(trxCreateResult.transactionId)

  if (trxCreateResult.handlerFailed) {
    if (trxCreateResult.reversed) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_PROCESSING_ERROR_AND_REVERSED,
        trxCreateResult
      )
    } else if (trxCreateResult.handlerResponse) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_RESPONSE_ERROR,
        trxCreateResult
      )
    } else {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_NO_RESPONSE,
        trxCreateResult
      )
    }
  } else {
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
}

module.exports.reverseTransaction = async (req, res, next) => {
  const reverseParams = {
    agentId: req.auth.agentId,
    transactionId: req.params.transactionId,
    agentOrderReference: req.params.agentOrderReference,
    ctxOptions: {
      debug: isEnvProduction ? undefined : req.body.debug
    }
  }
  if (Array.isArray(req.reverseTypes)) reverseParams.reverseTypes = req.reverseTypes
  const trxReverseResult = await trxManager.reverse(reverseParams)

  trxReverseResult.transaction = await models.transaction
    .scope('agent')
    .findByPk(trxReverseResult.transactionId)

  if (trxReverseResult.handlerFailed) {
    if (trxReverseResult.handlerResponse) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_RESPONSE_ERROR,
        trxReverseResult
      )
    } else {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_NO_RESPONSE,
        trxReverseResult
      )
    }
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_REVERSED,
      trxReverseResult
    )
  }
}

module.exports.voidTransaction = async (req, res, next) => {
  const trxVoidResult = await trxManager.void({
    agentId: req.auth.agentId,
    transactionId: req.params.transactionId,
    voidReason: req.body.voidReason,
    ctxOptions: {
      debug: isEnvProduction ? undefined : req.body.debug
    }
  })
  trxVoidResult.transaction = await models.transaction
    .scope('agent')
    .findByPk(trxVoidResult.transactionId)

  if (trxVoidResult.handlerFailed) {
    if (trxVoidResult.reversed) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_PROCESSING_ERROR_AND_REVERSED,
        trxVoidResult
      )
    } else if (trxVoidResult.handlerResponse) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_RESPONSE_ERROR,
        trxVoidResult
      )
    } else {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_NO_RESPONSE,
        trxVoidResult
      )
    }
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_VOIDED,
      trxVoidResult
    )
  }
}

module.exports.refundTransaction = async (req, res, next) => {
  const trxRefundResult = await trxManager.refund({
    agentId: req.auth.agentId,
    transactionRefund: {
      transactionId: req.params.transactionId,
      amount: req.body.amount,
      reason: req.body.reason
    },
    ctxOptions: {
      debug: isEnvProduction ? undefined : req.body.debug
    }
  })
  trxRefundResult.transaction = await models.transaction
    .scope('agent')
    .findByPk(trxRefundResult.transactionId)

  if (trxRefundResult.transactionStatus === trxManager.transactionStatuses.REFUNDED_PARTIAL) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_PARTIALLY_REFUNDED,
      trxRefundResult
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_TRANSACTION_REFUNDED,
      trxRefundResult
    )
  }
}

module.exports.changeAgentTransactionStatus = async (req, res, next) => {
  const trxForceUpdateResult = await trxManager.forceStatusUpdate(
    {
      agentId: req.auth.agentId,
      transactionId: req.body.transactionId,
      newTransactionStatus: req.body.status,
      syncWithAcquirerHost: req.body.syncWithAcquirerHost,
      ctxOptions: {
        debug: isEnvProduction ? undefined : req.body.debug
      }
    }
  )
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    trxForceUpdateResult
  )
}

// TODO: not working in postgres
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

// TODO: not working in postgres
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

module.exports.createTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  transactionValidator.createTransactionValidator,
  errorMiddleware.validatorErrorHandler,
  exports.createTransaction,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.reverseTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.reverseTransaction
]

module.exports.reverseVoidTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  (req, res, next) => {
    req.reverseTypes = ['void']
    next()
  },
  exports.reverseTransaction
]

module.exports.voidTransactionMiddlewares = [
  cipherboxMiddleware.processCipherbox(true),
  exports.voidTransaction
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

module.exports.getTransactionsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'transaction',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.transactionId',
      as: 'id'
    },
    sequelizePaginationScopeParam: {
      validModels: ['transaction']
    },
    sequelizeFilterScopeParam: {
      validModels: [
        'transaction',
        'acquirer',
        'acquirerType',
        'acquirerConfigAgent',
        'acquirerConfigOutlet',
        'agent',
        'outlet',
        'merchant'
      ]
    }
  })
]

module.exports.getAgentTransactionsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'transaction',
    modelScope: ({ req }) =>
      ({ method: ['agent', req.auth.agentId] }),
    identifierSource: {
      path: 'params.transactionId',
      as: 'id'
    },
    responseHandler: ({ crudCtx }) => {
      if (Array.isArray(crudCtx.modelInstance)) {
        crudCtx.response = crudCtx.modelInstance.map((transaction) => {
          transaction = transaction.toJSON()
          transaction.acquirer._handler =
            trxManager.getAcquirerInfo(transaction.acquirer.acquirerConfig.handler) || null
          return transaction
        })
      } else {
        if (crudCtx.modelInstance) {
          crudCtx.response = crudCtx.modelInstance.toJSON()
          crudCtx.response.acquirer._handler =
            trxManager.getAcquirerInfo(crudCtx.response.acquirer.acquirerConfig.handler) || null
        }
      }
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['transaction']
    },
    sequelizeFilterScopeParam: {
      validModels: [
        'transaction',
        'acquirer',
        'acquirerType',
        'acquirerConfig',
        'acquirerConfigAgent',
        'acquirerConfigOutlet',
        'acquirerTerminal',
        'acquirerTerminalCommon',
        'acquirerCompany'
      ]
    }
  })
]

module.exports.getMerchantStaffTransactionsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'transaction',
    modelScope: ({ crudCtx, req }) => (
      {
        method: [
          'merchantStaff',
          req.auth.merchantStaffId,
          crudCtx.getSecondaryIdentifier({
            path: 'params.outletId'
          })
        ]
      }
    ),
    identifierSource: {
      path: 'params.transactionId',
      as: 'id'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['transaction']
    },
    sequelizeFilterScopeParam: {
      validModels:
        ['transaction', 'agent', 'outlet', 'acquirer', 'acquirerType', 'acquirerConfig']
    }
  })
]

module.exports.getAcquirerStaffTransactionsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'transaction',
    modelScope: ({ req }) => ({ method: ['acquirerStaff', req.auth.acquirerCompanyId] }),
    identifierSource: {
      path: 'params.transactionId',
      as: 'id'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['transaction']
    },
    sequelizeFilterScopeParam: {
      validModels:
        ['transaction', 'agent', 'outlet', 'acquirer', 'acquirerType', 'acquirerConfig']
    }
  })
]

module.exports.getAgentTransactionTotalSuccessMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'transaction',
    modelScope: ({ req }) =>
      ([
        'totalSuccessAmount',
        {
          where: { agentId: req.auth.agentId },
          include: [
            {
              model: models.acquirer,
              attributes: [],
              include: [
                {
                  model: models.acquirerType,
                  attributes: []
                }
              ]
            }
          ],
          raw: true
        }
      ]),
    responseHandler: ({ crudCtx }) => {
      if (crudCtx.modelInstance) {
        crudCtx.response = crudCtx.modelInstance[0]
        crudCtx.response.totalAmount = crudCtx.response.totalAmount || '0.00'
        crudCtx.response.transactionCount = parseInt(crudCtx.response.transactionCount)
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_SUCCESS
      }
    },
    sequelizeCommonScopeParam: {},
    sequelizeFilterScopeParam: {
      validModels: [
        'transaction',
        'acquirer',
        'acquirerType',
        'acquirerConfig',
        'acquirerConfigAgent',
        'acquirerConfigOutlet',
        'acquirerTerminal',
        'acquirerTerminalCommon',
        'acquirerCompany'
      ]
    }
  })
]

// TODO: not working in postgres
module.exports.getMerchantStaffAcquirerTransactionStatsMiddlewares = [
  queryToSequelizeMiddleware.filterValidator(
    ['transaction', 'agent', 'acquirer', 'acquirerType']
  ),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.filter,
  exports.getMerchantStaffAcquirerTransactionStats
]

// TODO: not working in postgres
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
