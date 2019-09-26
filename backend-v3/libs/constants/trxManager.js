'use strict'

/**
 * Internal events enumeration used by event emitter
 * and dtimer
 */
module.exports.eventTypes = {
  TRANSACTION_STATUS_CHANGE: 'transactionStatusChange',
  TRANSACTION_EXPIRY: 'transactionExpiry'
}

/**
 * Enumeration of transaction status in mika system
 */
module.exports.transactionStatuses = {
  CREATED: 'created',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  FAILED: 'failed',
  SUCCESS: 'success',
  VOIDED: 'voided',
  REFUNDED_PARTIAL: 'refundedPartial',
  REFUNDED: 'refunded'
}

/**
 * Enumeration of settlement status in mika backend
 */
module.exports.transactionSettlementStatuses = {
  UNSETTLED: 'unsettled',
  SETTLED_IN: 'settledIn',
  SETTLED: 'settled'
}

/**
 * Merchant presented/acquirer generated type of token
 */
module.exports.tokenTypes = {
  TOKEN_QRCODE_CONTENT: 'tokenQrCodeContent',
  TOKEN_QRCODE_URL_IMAGE: 'tokenQrCodeUrlImage'
}

/**
 * User presented/user generated type of token
 */
module.exports.userTokenTypes = {
  USER_TOKEN_QRCODE_CONTENT: 'userTokenQrCodeContent',
  USER_TOKEN_URL_IMAGE: 'userTokenQrCodeUrlImage',
  USER_TOKEN_PIN: 'userTokenPIN',
  USER_TOKEN_EMV_MIKA: 'userTokenEmvTagsMika_57_82_95_9A_9C_5F2A_5F34_9F02_9F03_9F10_9F1A_9F26_9F27_9F33_9F34_9F35_9F36_9F37'
}

/**
 * Definition of payment flow accepted by acquirer
 */
module.exports.transactionFlows = {
  PROVIDE_TOKEN: 'flowProvideToken',
  GET_TOKEN: 'flowGetToken',
  GATEWAY: 'flowGateway',
  REFUND: 'flowRefund',
  PARTIAL_REFUND: 'flowPartialRefund',
  VOID: 'flowVoid'
}

/**
 * Definition of extra flags
 */
module.exports.transactionFlags = {
}

/**
 * Shared error code used in trxManager function and
 * acquirer handler
 */
module.exports.errorTypes = {
  INVALID_TRANSACTION: 'trxManagerInvalidTransaction',
  INVALID_AGENT: 'trxManagerInvalidAgent',
  INVALID_ACQUIRER: 'trxManagerInvalidAcquirer',

  INVALID_ACQUIRER_HANDLER: 'trxManagerInvalidAcquirerHandler',
  INVALID_ACQUIRER_CONFIG: 'trxManagerInvalidAcquirerConfig',

  AMOUNT_TOO_LOW: 'trxManagerAmountATooLow',
  AMOUNT_TOO_HIGH: 'trxManagerAmountATooHigh',
  NEED_USER_TOKEN: 'trxManagerUserTokenNeeded',
  NEED_USER_TOKEN_TYPE: 'trxManagerUserTokenTypeNeeded',
  INVALID_USER_TOKEN: 'trxManagerUserTokenInvalid',
  INVALID_USER_TOKEN_TYPE: 'trxManagerUserTokenTypeInvalid',

  REFUND_NOT_SUPPORTED: 'trxManagerRefundNotSupported',
  PARTIAL_REFUND_NOT_SUPPORTED: 'trxManagerPartialRefundNotSupported',
  INVALID_REFUND_AMOUNT: 'trxManagerInvalidRefundAmount',

  VOID_NOT_SUPPORTED: 'trxManagerVoidNotSupported',

  INVALID_TRANSACTION_ON_ACQUIRER_HOST: 'trxManagerInvalidTransactionOnAcquirerHost',
  ACQUIRER_HOST_UNAVAILABLE: 'trxManagerAcquirerHostUnavailable',
  ACQUIRER_HOST_UNABLE_TO_PROCESS: 'trxManagerAcquirerUnableToProcess',

  JUST_ERROR: 'trxManagerUnknownError'
}
