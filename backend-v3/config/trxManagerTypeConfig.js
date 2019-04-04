'use strict'

const configName = 'trxManagerType'

let baseConfig = {
  /**
  * Enumeration of transaction status in mika system
  */
  transactionStatuses: {
    SUCCESS: 'success',
    FAILED: 'failed',
    VOIDED: 'voided',
    CREATED: 'created',
    EXPIRED: 'expired',
    PENDING: 'pending',
    ERROR: 'error'
  },

  /**
  * Enumeration of settlement status in mika backend
  */
  transactionSettlementStatuses: {
    UNSETTLED: 'unsettled',
    SETTLED_IN: 'settledIn',
    SETTLED: 'settled',
    ERROR: 'error'
  },

  /**
  * Enumeration of transaction event, mainly used in notification
  * (Public API and notification)
  */
  transactionEvents: {
    CREATED: 'transactionCreated',
    CREATED_WITH_DATA: 'transactionCreatedWithData',
    SUCCESS: 'transactionSuccess',
    SUCCESS_WITH_DATA: 'transactionSuccessWithData',
    FAILED: 'transactionFailed',
    FAILED_WITH_DATA: 'transactionFailedWithData',
    EXPIRED: 'transactionExpired',
    GLOBAL_TIMEOUT: 'transactionGlobalTimeout'
  },

  /**
  * Merchant presented/payment provider generated type of token
  */
  tokenTypes: {
    TOKEN_QRCODE_CONTENT: 'tokenQrCodeContent',
    TOKEN_QRCODE_URL_IMAGE: 'tokenQrCodeUrlImage'
  },

  /**
  * User presented/user generated type of token
  */
  userTokenTypes: {
    USER_TOKEN_QRCODE_CONTENT: 'userTokenQrCodeContent',
    USER_TOKEN_URL_IMAGE: 'userTokenQrCodeUrlImage',
    USER_TOKEN_PIN: 'userTokenPIN',
    USER_TOKEN_EMV_MIKA: 'userTokenEmvTagsMika_57_82_95_9A_9C_5F2A_5F34_9F02_9F03_9F10_9F1A_9F26_9F27_9F33_9F34_9F35_9F36_9F37'
  },

  /**
  * Definition of payment flow accepted by payment provider
  */
  transactionFlows: {
    PROVIDE_TOKEN: 'flowProvideToken',
    GET_TOKEN: 'flowGetToken',
    GATEWAY: 'flowGateway'
  },

  /**
  * Definition of extra flags
  */
  transactionFlags: {
    NO_AMOUNT_CHECK: 'flagsNoAmountCheck'
  },

  /**
  * Shared error code used in trxManager function and
  * payment provider handler
  */
  errorCodes: {
    AMOUNT_TOO_LOW: 'amountATooLow',
    AMOUNT_TOO_HIGH: 'amountATooHigh',
    PAYMENT_PROVIDER_NOT_FOR_YOU: 'invalidPaymentProvider',
    NEED_EXTRA_CONFIG: 'extraConfigNeeded',
    NEED_USER_TOKEN: 'userTokenNeeded',
    JUST_ERROR: 'unknownError'
  }
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraBaseConfig = require(`./${configName}_extra`)
  baseConfig = Object.assign({}, baseConfig, extraBaseConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
