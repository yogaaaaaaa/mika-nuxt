'use strict'

const apiObjectFactory = require('../helpers/extApiObjectFactory')
const msgFactory = require('../helpers/msgFactory')
const trxManager = require('../helpers/trxManager')
const apiTransactionCallback = require('../helpers/extApiTransactionCallback')

module.exports.getRoot = async (req, res, next) => {
  res.status(msgFactory.msgTypes.MSG_SUCCESS_GENERIC.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_GENERIC,
      'Mika Public API'
    )
  )
}

module.exports.getTransactions = async (req, res, next) => {
  let data = null
  let page = 1

  if (req.query.page) {
    page = req.query.page
  }

  if (req.apiAuth.merchantIds.length > 0) {
    data = await apiObjectFactory.generateTransactionObjectsByMerchantIds(req.apiAuth.merchantIds, page)
  }

  res.status(msgFactory.msgTypes.MSG_SUCCESS_GENERIC.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_GENERIC, data
    )
  )
}

module.exports.getTransactionsByAgent = async (req, res, next) => {
  let data = null
  let page = 1

  if (req.query.page) {
    page = req.query.page
  }

  data = await apiObjectFactory.generateTransactionObjectsByAgentId(req.params.agentId, page)

  res.status(msgFactory.msgTypes.MSG_SUCCESS_GENERIC.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_GENERIC, data
    )
  )
}

module.exports.getTransactionById = async (req, res, next) => {
  if (req.params.transactionId) {
    let transactionObject = await apiObjectFactory.generateTransactionObject(req.params.transactionId, req.apiAuth.merchantIds)
    if (transactionObject) {
      res.status(msgFactory.msgTypes.MSG_SUCCESS_GENERIC.code).send(
        msgFactory.generateExtApiResponseMessage(
          msgFactory.msgTypes.MSG_SUCCESS_GENERIC,
          transactionObject
        )
      )
      return
    }
  }

  res.status(msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND
    )
  )
}

module.exports.getAgents = async (req, res, next) => {
  let page = 1

  if (req.query.page) {
    page = req.query.page
  }

  res.status(msgFactory.msgTypes.MSG_SUCCESS_GENERIC.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_GENERIC,
      await apiObjectFactory.generateAgentObjectsByMerchantIds(req.apiAuth.merchantIds, page)
    )
  )
}

module.exports.getAgentsById = async (req, res, next) => {
  res.status(msgFactory.msgTypes.MSG_SUCCESS_GENERIC.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_GENERIC,
      await apiObjectFactory.generateAgentObject(req.params.agentId)
    )
  )
}

module.exports.postTransaction = async (req, res, next) => {
  let createdTransaction = await trxManager.createTransaction(req.body.agentId, req.body.paymentGatewayId, req.body.amount)

  if (createdTransaction.error) {
    if (createdTransaction.error === trxManager.errorCode.AMOUNT_TOO_LOW) {
      res.status(msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_LOW.code).send(
        msgFactory.generateExtApiResponseMessage(
          msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_LOW
        )
      )
      return
    }

    if (createdTransaction.error === trxManager.errorCode.AMOUNT_TOO_HIGH) {
      res.status(msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_HIGH.code).send(
        msgFactory.generateExtApiResponseMessage(
          msgFactory.msgTypes.MSG_ERROR_AMOUNT_TOO_HIGH
        )
      )
      return
    }

    if (createdTransaction.error === trxManager.errorCode.PAYMENT_GATEWAY_NOT_FOR_YOU) {
      res.status(msgFactory.msgTypes.MSG_ERROR_PG_NOT_FOR_YOU.code).send(
        msgFactory.generateExtApiResponseMessage(
          msgFactory.msgTypes.MSG_ERROR_PG_NOT_FOR_YOU
        )
      )
      return
    }

    res.status(msgFactory.msgTypes.MSG_ERROR_GENERIC.code).send(
      msgFactory.generateExtApiResponseMessage(
        msgFactory.msgTypes.MSG_ERROR_GENERIC
      )
    )
    return
  }

  let mappedTransactionData = apiObjectFactory.mapCreatedTransactionObject(createdTransaction)

  if (req.body.webhookUrl) {
    await apiTransactionCallback.addTransactionCallback(req.apiAuth.keyId, req.body.webhookUrl, createdTransaction.transactionId)
  }

  res.status(msgFactory.msgTypes.MSG_SUCCESS_CREATED.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_SUCCESS_CREATED,
      mappedTransactionData
    )
  )
}

module.exports.debugSetTransactionStatus = async (req, res, next) => {
  if (req.params.transactionId && req.params.transactionStatus) {
    if (await trxManager.forceTransactionStatus(req.params.transactionId, req.params.transactionStatus)) {
      res.status(msgFactory.msgTypes.MSG_OPS_SUCCESS_GENERIC.code).send(
        msgFactory.generateExtApiResponseMessage(
          msgFactory.msgTypes.MSG_OPS_SUCCESS_GENERIC
        )
      )
      return
    }
  }
  res.status(msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST.code).send(
    msgFactory.generateExtApiResponseMessage(
      msgFactory.msgTypes.MSG_ERROR_BAD_REQUEST
    )
  )
}
