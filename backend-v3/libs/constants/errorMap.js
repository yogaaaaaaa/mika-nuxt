'use strict'

/**
 * Standard error map to msgType
 */

const msgTypes = require('./msg').msgTypes

const trxManagerErrorTypes = require('./trxManager').errorTypes
const authErrorTypes = require('./auth').errorTypes
const genericErrorTypes = require('./genericErrorTypes')

module.exports = (err) => {
  switch (err.name) {
    // trxManager error mapping
    case trxManagerErrorTypes.AMOUNT_TOO_LOW:
      return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_LOW
    case trxManagerErrorTypes.AMOUNT_TOO_HIGH:
      return msgTypes.MSG_ERROR_TRANSACTION_AMOUNT_TOO_HIGH
    case trxManagerErrorTypes.NEED_USER_TOKEN:
      return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN
    case trxManagerErrorTypes.INVALID_ACQUIRER:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER

    case trxManagerErrorTypes.INVALID_TRANSACTION:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID
    case trxManagerErrorTypes.INVALID_AGENT:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_AGENT

    case trxManagerErrorTypes.INVALID_USER_TOKEN:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_USER_TOKEN
    case trxManagerErrorTypes.NEED_USER_TOKEN_TYPE:
      return msgTypes.MSG_ERROR_TRANSACTION_NEED_USER_TOKEN_TYPE

    case trxManagerErrorTypes.INVALID_USER_TOKEN_TYPE:
      return msgTypes.MSG_ERROR_TRANSACTION_USER_TOKEN_NOT_SUPPORTED

    case trxManagerErrorTypes.INVALID_ACQUIRER_HANDLER:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG

    case trxManagerErrorTypes.INVALID_ACQUIRER_CONFIG:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG
    case trxManagerErrorTypes.REFUND_NOT_SUPPORTED:
      return msgTypes.MSG_ERROR_TRANSACTION_REFUND_NOT_SUPPORTED
    case trxManagerErrorTypes.PARTIAL_REFUND_NOT_SUPPORTED:
      return msgTypes.MSG_ERROR_TRANSACTION_PARTIAL_REFUND_NOT_SUPPORTED

    case trxManagerErrorTypes.VOID_NOT_SUPPORTED:
      return msgTypes.MSG_ERROR_TRANSACTION_VOID_NOT_SUPPORTED
    case trxManagerErrorTypes.INVALID_REFUND_AMOUNT:
      return msgTypes.MSG_ERROR_TRANSACTION_REFUND_INVALID_AMOUNT

    case trxManagerErrorTypes.ACQUIRER_HOST_UNAVAILABLE:
      return msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_UNAVAILABLE
    case trxManagerErrorTypes.ACQUIRER_HOST_UNABLE_TO_PROCESS:
      return msgTypes.MSG_ERROR_TRANSACTION_ACQUIRER_HOST_UNABLE_TO_PROCESS
    case trxManagerErrorTypes.INVALID_TRANSACTION_ON_ACQUIRER_HOST:
      return msgTypes.MSG_ERROR_TRANSACTION_INVALID_ON_ACQUIRER_HOST

    // auth error mapping
    case authErrorTypes.NOT_ALLOWED_TO_CHANGE_PASSWORD:
      return msgTypes.MSG_ERROR_AUTH_NOT_ALLOWED_TO_CHANGE_PASSWORD
    case authErrorTypes.PASSWORD_EXPIRED:
      return msgTypes.MSG_ERROR_AUTH_INVALID_EXPIRED_PASSWORD
    case authErrorTypes.FAILED_LOGIN_ATTEMPT_EXCEEDED:
      return msgTypes.MSG_ERROR_AUTH_FAILED_LOGIN_ATTEMPT_EXCEEDED
    case authErrorTypes.INVALID_OLD_PASSWORD:
      return msgTypes.MSG_ERROR_AUTH_INVALID_OLD_PASSWORD
    case authErrorTypes.CANNOT_CHANGE_TO_USED_PASSWORD:
      return msgTypes.MSG_ERROR_AUTH_CANNOT_CHANGE_TO_USED_PASSWORD

    // generic error mapping
    case genericErrorTypes.ENTITY_NOT_FOUND:
      return msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
  }
}
