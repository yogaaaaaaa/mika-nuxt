'use strict'

/**
 * Contain enumeration of transaction and acquirer providers.
 */

const configName = 'trxManagerType'

let baseConfig = {
  /**
   * Internal events enumeration used by event emitter
   * and dtimer
   */
  eventTypes: {
    TRANSACTION_STATUS_CHANGE: 'transactionStatusChange',
    TRANSACTION_EXPIRY: 'transactionExpiry'
  },

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
  * Merchant presented/acquirer generated type of token
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
  * Definition of payment flow accepted by acquirer
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
  },

  /**
  * Shared error code used in trxManager function and
  * acquirer handler
  */
  errorTypes: {
    INVALID_TRANSACTION: 'trxManagerTransactionNotFound',
    INVALID_AGENT: 'trxManagerAgentNotFound',
    AMOUNT_TOO_LOW: 'trxManagerAmountATooLow',
    AMOUNT_TOO_HIGH: 'trxManagerAmountATooHigh',
    INVALID_ACQUIRER: 'trxManagerInvalidAcquirer',
    INVALID_ACQUIRER_HANDLER: 'trxManagerPpHandlerNotFound',
    ACQUIRER_NOT_RESPONDING: 'trxManagerAcquirerNotResponding',
    NEED_EXTRA_CONFIG: 'trxManagerExtraConfigNeeded',
    NEED_USER_TOKEN: 'trxManagerUserTokenNeeded',
    INVALID_USER_TOKEN: 'trxManagerUserTokenInvalid',
    JUST_ERROR: 'trxManagerUnknownError'
  }
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  baseConfig = Object.assign({}, baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
