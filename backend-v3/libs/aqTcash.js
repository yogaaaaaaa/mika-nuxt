'use strict'

/**
 * Providing various constant and function related to tcash acquirer
 */

module.exports.handlerName = 'tcash'
module.exports.handlerClasses = ['linkaja', 'tcash']

module.exports.baseConfig = require('../configs/aqTcashConfig')

module.exports.tcashMessageCode = {
  TCASH_INQUIRY_SUCCESS: {
    code: '00',
    message: 'Inquiry OK'
  },
  TCASH_PAY_SUCCESS: {
    code: '00',
    message: 'Payment Success'
  },
  TCASH_ERROR_TRANSACTION_NOT_FOUND: {
    code: '40',
    message: 'Transaction Not Found'
  },
  TCASH_ERROR_TRANSACTION_NOT_VALID: {
    code: '41',
    message: 'Transaction Not Valid'
  },
  TCASH_ERROR_INTERNAL: {
    code: '10',
    message: 'System Error'
  }
}

module.exports.tcashTrxType = {
  TCASH_INQUIRY: '021',
  TCASH_PAY: '022'
}

module.exports.tcashInquiryResponse = (
  tcashMerchantName,
  transactionId,
  amount,
  tcashMessageCode = exports.tcashMessageCode.TCASH_INQUIRY_SUCCESS
) => {
  return `${tcashMessageCode.code}:${tcashMerchantName}:${amount}:${transactionId}:${tcashMessageCode.message}`
}

module.exports.tcashPayResponse = (
  tcashTransactionId,
  transactionId,
  tcashMessageCode = exports.tcashMessageCode.TCASH_PAY_SUCCESS
) => {
  return `${tcashMessageCode.code}:${tcashTransactionId}:${transactionId}:${tcashMessageCode.message}`
}

module.exports.tcashErrorResponse = (
  tcashMessageCode = exports.tcashMessageCode.TCASH_ERROR_INTERNAL
) => {
  return `${tcashMessageCode.code}:${tcashMessageCode.message}`
}

module.exports.mixConfig = (config) => {
  return Object.assign({}, exports.baseConfig, config)
}

module.exports.createQrCode = (config) => {
  return `TWALLET|O|${config.tcashUser}|${config.acc_no}`
}
