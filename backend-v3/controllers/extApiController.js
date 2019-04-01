'use strict'

const apiObjectFactory = require('../helpers/extApiObjectFactory')
const apiMsgFactory = require('../helpers/msgFactory')
const transactionManager = require('../helpers/transactionManager')
const apiTransactionCallback = require('../helpers/extApiTransactionCallback')

module.exports.getRoot = async (req, res, next) => {
  res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC,
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

  res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC, data
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

  res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC, data
    )
  )
}

module.exports.getTransactionById = async (req, res, next) => {
  if (req.params.transactionId) {
    let transactionObject = await apiObjectFactory.generateTransactionObject(req.params.transactionId, req.apiAuth.merchantIds)
    if (transactionObject) {
      res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC.code).send(
        apiMsgFactory.generateExtApiResponseMessage(
          apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC,
          transactionObject
        )
      )
      return
    }
  }

  res.status(apiMsgFactory.messageTypes.MSG_ERROR_ENTITY_NOT_FOUND.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
  )
}

module.exports.getAgents = async (req, res, next) => {
  let page = 1

  if (req.query.page) {
    page = req.query.page
  }

  res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC,
      await apiObjectFactory.generateAgentObjectsByMerchantIds(req.apiAuth.merchantIds, page)
    )
  )
}

module.exports.getAgentsById = async (req, res, next) => {
  res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_SUCCESS_GENERIC,
      await apiObjectFactory.generateAgentObject(req.params.agentId)
    )
  )
}

module.exports.postTransaction = async (req, res, next) => {
  let createdTransaction = await transactionManager.createTransaction(req.body.agentId, req.body.paymentGatewayId, req.body.amount)

  if (createdTransaction.error) {
    if (createdTransaction.error === transactionManager.errorCode.AMOUNT_TOO_LOW) {
      res.status(apiMsgFactory.messageTypes.MSG_ERROR_AMOUNT_TOO_LOW.code).send(
        apiMsgFactory.generateExtApiResponseMessage(
          apiMsgFactory.messageTypes.MSG_ERROR_AMOUNT_TOO_LOW
        )
      )
      return
    }

    if (createdTransaction.error === transactionManager.errorCode.AMOUNT_TOO_HIGH) {
      res.status(apiMsgFactory.messageTypes.MSG_ERROR_AMOUNT_TOO_HIGH.code).send(
        apiMsgFactory.generateExtApiResponseMessage(
          apiMsgFactory.messageTypes.MSG_ERROR_AMOUNT_TOO_HIGH
        )
      )
      return
    }

    if (createdTransaction.error === transactionManager.errorCode.PAYMENT_GATEWAY_NOT_FOR_YOU) {
      res.status(apiMsgFactory.messageTypes.MSG_ERROR_PG_NOT_FOR_YOU.code).send(
        apiMsgFactory.generateExtApiResponseMessage(
          apiMsgFactory.messageTypes.MSG_ERROR_PG_NOT_FOR_YOU
        )
      )
      return
    }

    res.status(apiMsgFactory.messageTypes.MSG_ERROR_GENERIC.code).send(
      apiMsgFactory.generateExtApiResponseMessage(
        apiMsgFactory.messageTypes.MSG_ERROR_GENERIC
      )
    )
    return
  }

  let mappedTransactionData = apiObjectFactory.mapCreatedTransactionObject(createdTransaction)

  if (req.body.webhookUrl) {
    await apiTransactionCallback.addTransactionCallback(req.apiAuth.keyId, req.body.webhookUrl, createdTransaction.transactionId)
  }

  res.status(apiMsgFactory.messageTypes.MSG_SUCCESS_CREATED.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_SUCCESS_CREATED,
      mappedTransactionData
    )
  )
}

module.exports.debugSetTransactionStatus = async (req, res, next) => {
  if (req.params.transactionId && req.params.transactionStatus) {
    if (await transactionManager.forceTransactionStatus(req.params.transactionId, req.params.transactionStatus)) {
      res.status(apiMsgFactory.messageTypes.MSG_OPS_SUCCESS_GENERIC.code).send(
        apiMsgFactory.generateExtApiResponseMessage(
          apiMsgFactory.messageTypes.MSG_OPS_SUCCESS_GENERIC
        )
      )
      return
    }
  }
  res.status(apiMsgFactory.messageTypes.MSG_ERROR_BAD_REQUEST.code).send(
    apiMsgFactory.generateExtApiResponseMessage(
      apiMsgFactory.messageTypes.MSG_ERROR_BAD_REQUEST
    )
  )
}
