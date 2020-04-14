'use strict'

/**
 * Internal events enumeration used by event emitter
 * and dtimer
 */
module.exports.eventTypes = {
  TRANSACTION_EVENT: 'transactionEvent',
  SETTLE_BATCH_EVENT: 'settleBatchEvent',

  TRANSACTION_EXPIRY: 'transactionExpiry'
}

/**
 * Enumeration of payment classes
 */
module.exports.paymentClasses = {
  KUMAPAY: 'kumapay',

  QRIS: 'qris',
  CARD_PREPAID: 'cardPrepaid',
  CARD_CREDIT: 'cardCredit',
  CARD_DEBIT: 'cardDebit',

  TCASH: 'tcash',
  LINKAJA: 'linkaja',
  GOPAY: 'gopay',
  ALIPAY: 'alipay',
  WECHATPAY: 'wechatpay',
  DANA: 'dana',

  CARD_SWITCHER: 'cardSwitcher'
}

/**
 * Enumeration of transaction status in mika system
 */
module.exports.transactionStatuses = {
  CREATED: 'created',

  PROCESSING: 'processing',
  CHALLENGING: 'challenging',
  VOIDING: 'voiding',

  SUCCESS: 'success',

  REVERSED: 'reversed',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  FAILED: 'failed',
  VOIDED: 'voided',
  REFUNDED_PARTIAL: 'refundedPartial',
  REFUNDED: 'refunded'
}

/**
 * Enumeration of settlement batch status in mika system
 */
module.exports.settleBatchStatuses = {
  OPEN: 'open',
  PROCESSING: 'processing',
  PROCESSING_ERROR: 'processingError',
  CLOSED: 'closed'
}

/**
 * Merchant presented type of token
 */
module.exports.tokenTypes = {
  TOKEN_QRCODE_CONTENT: 'tokenQrCodeContent',
  TOKEN_QRCODE_URL_IMAGE: 'tokenQrCodeUrlImage'
}

/**
 * User presented type of token
 */
module.exports.userTokenTypes = {
  USER_TOKEN_QRCODE_CONTENT: 'userTokenQrCodeContent',
  USER_TOKEN_URL_IMAGE: 'userTokenQrCodeUrlImage',
  USER_TOKEN_CODE: 'userTokenCode',

  USER_TOKEN_CARD: 'userTokenCard@57_82_84_95_98_9A_9B_9C_5F2A_9F02_9F03_9F09_9F10_9F1A_9F1E_9F26_9F27_9F33_9F34_9F35_9F36_9F37_9F41_9F53_5F34_9F12',
  USER_TOKEN_CARD_PAN: 'userTokenCardPan',
  USER_TOKEN_CARD_CVM_FOLLOW_CARD: 'userTokenCardCvmFollowCard',
  USER_TOKEN_CARD_CVM_ONLINE_PIN: 'userTokenCardCvmOnlinePin',
  USER_TOKEN_CARD_CVM_SIGNATURE: 'userTokenCardCvmSignature'
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
  VOID: 'flowVoid',
  REVERSE_SUCCESS: 'flowReverseSuccess',
  REVERSE_VOID: 'flowReverseVoid'
}

/**
 * Definition of extra flags
 */
module.exports.transactionFlags = {
}

/**
 * Shared error name used in trxManager function and
 * acquirer handler
 */
module.exports.errorTypes = {
  INVALID_TRANSACTION: 'trxManagerInvalidTransaction',
  INVALID_AGENT: 'trxManagerInvalidAgent',
  INVALID_ACQUIRER: 'trxManagerInvalidAcquirer',
  UNFINISHED_TRANSACTION_EXIST: 'trxManagerUnfinishedTransactionExist',

  UNFINISHED_SETTLE_BATCH: 'trxManagerUnfinishedSettleBatch',
  INVALID_SETTLE_BATCH: 'trxManagerInvalidSettleBatch',

  INVALID_ACQUIRER_HANDLER: 'trxManagerInvalidAcquirerHandler',
  INVALID_ACQUIRER_CONFIG: 'trxManagerInvalidAcquirerConfig',
  SYSTEM_NOT_INIT: 'trxManagerSystemNotInitialized',

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
  REVERSE_NOT_SUPPORTED: 'reverseNotSupported',

  INVALID_TRANSACTION_ON_ACQUIRER_HOST: 'trxManagerInvalidTransactionOnAcquirerHost',
  ACQUIRER_HOST_NO_RESPONSE: 'trxManagerAcquirerHostNoResponse',
  ACQUIRER_HOST_RESPONSE_ERROR: 'trxManagerAcquirerHostResponseError',

  TOO_MANY_REDIRECT: 'trxManagerTooManyRedirect',
  REDIRECT_NO_MATCH: 'trxManagerRedirectNoMatch',

  STILL_RUNNING: 'trxManagerStillRunning',

  JUST_ERROR: 'trxManagerUnknownError'
}
