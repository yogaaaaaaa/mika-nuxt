'use strict'

const { msgTypes, expressResponse } = require('../../libs/msg')
const { errorTypes } = require('../../libs/trxManager')

module.exports.errorToMsgType = (err) => {
  switch (err.name) {
    case errorTypes.AMOUNT_TOO_LOW:
      return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_LOW
    case errorTypes.AMOUNT_TOO_HIGH:
      return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_HIGH
    case errorTypes.NEED_USER_TOKEN:
      return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN
    case errorTypes.INVALID_ACQUIRER:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER

    case errorTypes.INVALID_TRANSACTION:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID
    case errorTypes.INVALID_AGENT:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_AGENT

    case errorTypes.INVALID_USER_TOKEN:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_USER_TOKEN
    case errorTypes.NEED_USER_TOKEN_TYPE:
      return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN_TYPE

    case errorTypes.INVALID_USER_TOKEN_TYPE:
      return msgTypes.MSG_ERROR_TRANSACTION_USER_TOKEN_NOT_SUPPORTED

    case errorTypes.INVALID_ACQUIRER_HANDLER:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG

    case errorTypes.INVALID_ACQUIRER_CONFIG:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG
    case errorTypes.REFUND_NOT_SUPPORTED:
      return msgTypes.MSG_ERROR_TRANSACTION_REFUND_NOT_SUPPORTED
    case errorTypes.PARTIAL_REFUND_NOT_SUPPORTED:
      return msgTypes.MSG_ERROR_TRANSACTION_PARTIAL_REFUND_NOT_SUPPORTED

    case errorTypes.VOID_NOT_SUPPORTED:
      return msgTypes.MSG_ERROR_TRANSACTION_VOID_NOT_SUPPORTED
    case errorTypes.INVALID_REFUND_AMOUNT:
      return msgTypes.MSG_ERROR_TRANSACTION_REFUND_INVALID_AMOUNT

    case errorTypes.ACQUIRER_HOST_UNAVAILABLE:
      return msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_UNAVAILABLE
    case errorTypes.ACQUIRER_HOST_UNABLE_TO_PROCESS:
      return msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_UNABLE_TO_PROCESS
    case errorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ON_ACQUIRER_HOST
  }
}

module.exports.handleError = (err, res) => {
  let msgType = exports.errorToMsgType(err)
  if (msgType) {
    expressResponse(
      res,
      msgType
    )
  } else {
    throw err
  }
}
