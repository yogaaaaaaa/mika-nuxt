'use strict'

const msgFactory = require('../helpers/msgFactory')
const trxManager = require('../helpers/trxManager')

const models = require('../models')

/**
 * Create new transaction by agent (via `req.auth.userType`)
 */
module.exports.newTransaction = async (req, res, next) => {
  const options = {
    ipAddress: req.ip
  }

  if (req.auth.terminalId) {
    options.terminalId = req.auth.terminalId
  }

  if (req.body.userToken && req.body.userTokenType) {
    options.userToken = req.body.userToken
    options.userTokenType = req.body.userTokenType
  }

  if (req.body.flags) {
    options.flags = req.body.flags
  }

  const newTransaction = await trxManager.newTransaction(
    req.body.amount,
    req.body.paymentProviderId,
    req.auth.agentId,
    options
  )

  // translate error message
  if (newTransaction.error) {
    if (newTransaction.error === trxManager.errorCodes.AMOUNT_TOO_LOW) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_LOW
      )
    } else if (newTransaction.error === trxManager.errorCodes.AMOUNT_TOO_HIGH) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_HIGH
      )
    } else if (newTransaction.error === trxManager.errorCodes.NEED_USER_TOKEN) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_NEED_USER_TOKEN
      )
    } else if (newTransaction.error === trxManager.errorCodes.PAYMENT_PROVIDER_NOT_FOR_YOU) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_PAYMENT_PROVIDER_NOT_FOR_YOU
      )
    } else {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_CANNOT_CREATE_TRANSACTION,
        newTransaction
      )
    }
  }

  if (newTransaction.redirectTo) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_REDIRECTED,
      newTransaction
    )
    return
  }

  if (newTransaction.followUpType) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_PENDING_NEED_FOLLOW_UP,
      newTransaction
    )
    return
  }

  if (newTransaction.transactionStatus === trxManager.transactionStatuses.SUCCESS) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS,
      newTransaction
    )
    return
  }

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS_TRANSACTION_CREATED,
    newTransaction
  )
}

/**
 * Get one or many agent's transactions (via `req.auth.userType`)
 */
module.exports.getAgentTransactions = async (req, res, next) => {
  let query = {
    where: {
      agentId: req.auth.agentId
    },
    attributes: { exclude: ['deletedAt'] },
    include: [
      {
        model: models.paymentProvider,
        attributes: {
          exclude: [
            'shareMerchant',
            'shareMerchantWithPartner',
            'sharePartner',
            'directSettlement',
            'createdAt',
            'updatedAt',
            'deletedAt'
          ]
        },
        include: [
          {
            model: models.paymentProviderType,
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'deletedAt'
              ]
            }
          },
          {
            model: models.paymentProviderConfig,
            attributes: {
              exclude: [
                'config',
                'providerIdReference',
                'providerIdType',
                'createdAt',
                'updatedAt',
                'deletedAt'
              ]
            }
          }
        ]
      }
    ]
  }

  if (req.params.transactionId) {
    query.where.id = req.params.transactionId
    let transaction = await models.transaction.findOne(query)

    msgFactory.expressCreateResponse(
      res,
      transaction
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      transaction
    )
  } else {
    req.applyPaginationSequelize(query)
    req.applyFiltersWhereSequelize(query)
    let transactions = await models.transaction.findAndCountAll(query)

    msgFactory.expressCreateResponse(
      res,
      transactions.rows.length > 0
        ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      transactions.rows,
      msgFactory.createPaginationMeta(req.query.page, req.query.per_page, transactions.count)
    )
  }
}
