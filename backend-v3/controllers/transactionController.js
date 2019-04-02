'use strict'

const msgFactory = require('../helpers/msgFactory')
const transactionManager = require('../helpers/trxManager')

module.exports.createTransaction = async (req, res, next) => {
  const config = {}
  if (typeof req.body.user_token === 'object') {
    config.userToken = req.body.user_token
  }
  if (typeof req.body.flags === 'object') {
    config.flags = req.body.flags
  }

  const createdTransaction = await transactionManager.createTransaction(
    req.body.terminalId,
    req.body_paymentProviderId,
    req.body.amount,
    config)

  // translate error message
  if (createdTransaction.error) {
    if (createdTransaction.error === transactionManager.errorCode.AMOUNT_TOO_LOW) {
      return res.status(msgFactory.messageTypes.MSG_ERROR_AMOUNT_TOO_LOW.code).send(
        msgFactory.createResponseMessage(msgFactory.messageTypes.MSG_ERROR_AMOUNT_TOO_LOW, true)
      )
    }

    if (createdTransaction.error === transactionManager.errorCode.NEED_USER_TOKEN) {
      return res.status(msgFactory.messageTypes.MSG_ERROR_NEED_USER_TOKEN.code).send(
        msgFactory.createResponseMessage(msgFactory.messageTypes.MSG_ERROR_NEED_USER_TOKEN, true)
      )
    }

    if (createdTransaction.error === transactionManager.errorCode.PAYMENT_GATEWAY_NOT_FOR_YOU) {
      return res.status(msgFactory.messageTypes.MSG_ERROR_PAYMENT_GATEWAY_NOT_FOR_YOU.code).send(
        msgFactory.createResponseMessage(msgFactory.messageTypes.MSG_ERROR_PAYMENT_GATEWAY_NOT_FOR_YOU, true)
      )
    }

    return res.status(msgFactory.messageTypes.MSG_ERROR_CANNOT_CREATE_TRANSACTION.code).send(
      msgFactory.createResponseMessage(msgFactory.messageTypes.MSG_ERROR_CANNOT_CREATE_TRANSACTION, true)
    )
  }

  let response = msgFactory.createResponseMessage(
    msgFactory.messageTypes.MSG_TRANSACTION_CREATED,
    false,
    createdTransaction.transactionData
  )

  response.transactionId = createdTransaction.transactionId

  if (createdTransaction.token) {
    response.token = createdTransaction.token
    response.token_type = createdTransaction.tokenType
  }

  res
    .status(msgFactory.messageTypes.MSG_TRANSACTION_CREATED.code)
    .send(response)
}
