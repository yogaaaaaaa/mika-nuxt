'use strict'

/**
 * Helper to work with alto (alipay, wechatpay) payment gateway
 */

const crypto = require('crypto')
const superagent = require('superagent')

module.exports.handlerName = 'alto'
module.exports.handlerClasses = ['wechatpay', 'alipay']

module.exports.baseConfig = require('../configs/aqAltoConfig')

module.exports.mixConfig = (config) => {
  const mixedConfig = Object.assign({}, exports.baseConfig, config)
  if (mixedConfig.altoMchId) {
    mixedConfig.mch_id = mixedConfig.altoMchId
  }
  return mixedConfig
}

/**
 * Convert object to uriEncoded string, doesn't support nested object
 */
function objectToUriEncoded (object) {
  const component = []
  for (const property in object) {
    component.push(encodeURIComponent(`${property}=${object[property]}`))
  }
  return component.join('&')
}

function altoCreateContainer (altoPemPrivateKey, data, encode = false) {
  const signType = 'RSA'
  const sign = crypto.createSign('md5WithRSAEncryption')
    .update(Buffer.from(data, 'utf8'))
    .sign(altoPemPrivateKey)
    .toString('base64')

  const container = {
    sign_type: signType,
    sign: sign,
    data: data
  }

  if (encode === true) {
    return objectToUriEncoded(container)
  } else {
    return container
  }
}
module.exports.altoCreateContainer = altoCreateContainer

/**
 * Verify AltoPay container Object
 */
function altoVerifyContainer (altoPemAltoPublicKey, container) {
  if (container.sign) {
    if (container.data) {
      return crypto.createVerify('md5WithRSAEncryption')
        .update(Buffer.from(container.data, 'utf8'))
        .verify(altoPemAltoPublicKey, Buffer.from(container.sign, 'base64'))
    }
  }
}
module.exports.altoVerifyContainer = altoVerifyContainer

/**
 * Verify if code from alto is correct
 * @param {String} code
 * @returns {Boolean} Return true when no error is occurred
 */
function altoResponseCodeCorrect (code) {
  return parseInt(code) === 0
}

/**
 * Make common alto request, used in all alto API request
 */
async function altoRequest (url, request, config) {
  const response = await superagent.post(url)
    .type('application/x-www-form-urlencoded')
    .send(altoCreateContainer(config.altoPemPrivateKey, JSON.stringify(request)))

  if (
    altoResponseCodeCorrect(response.body.code) &&
    altoVerifyContainer(config.altoPemAltoPublicKey, response.body)
  ) {
    return JSON.parse(response.body.data)
  }
}

/**
 * Create qrcode payment (/mapi/pay/order) to Alto with config, i.e
 ```js
  config = {
   out_trade_no: transactionId,
   subject: 'Some Subject',   // Optional parameter
   amount: 5000
  }
  // or with supplied mch_id, overwrite from exports.baseConfig
  config = {
   mch_id: alto_merchantId,
   out_trade_no: transactionId,
   subject: 'Some Subject',   // Optional parameter
   amount: 5000
  }
 ```
 * And return transaction order object, i.e
 ```js
 altoMakePayment = {
   trade_no: '32031811271705290000',
   uri:'https://altopay-app.halodigit.com/qr/pay?tt=mgEBKwABAB4zMjAzMTgxMTI3MTcwNTI5MDAwMHwxMDAwMDE2NjgAAAFnVGqPxAERABA4WISn_QJp03olh9QIYA'
 }
 ```
 */
module.exports.altoMakeQrCodePayment = async function (config) {
  const request = {}
  request.mch_id = config.mch_id
  request.trade_type = 'QR_CODE'
  request.currency = config.currency
  request.out_trade_no = config.out_trade_no
  request.amount = config.amount
  request.subject = config.subject
  if (config.operator_id) { // Optional parameter
    request.operator_id = config.operator_id
  }
  request.notify_url = config.notify_url // notify_url is optional parameter, but required for obvious reason

  return altoRequest(`${config.baseUrl}/mapi/pay/order`, request, config)
}

/**
 * Query payment (/mapi/pay/query) to Alto config, i.e
 *
 ```js
 config = {
  out_trade_no: transactionId
 }
 ```
 *
 * return Payment status, i.e
 *
 ```js
 altoQueryPayment = {
  amount: "400",
  out_trade_no: "10960",
  operator_id: "0",
  trade_status: 0,
  trade_no: "32011811271533000043",
  currency: "IDR",
  mch_id: "100032",
  paytype: 0,
  finish_time: 0
 }
 ```
 */
module.exports.altoQueryPayment = async function (config) {
  const request = {}
  request.mch_id = config.mch_id
  if (config.out_trade_no) {
    request.out_trade_no = config.out_trade_no
  } else if (config.trade_no) {
    request.trade_no = config.trade_no
  }

  return altoRequest(`${config.baseUrl}/mapi/pay/query`, request, config)
}

/**
 * Refund payment (/mapi/pay/refund) to Alto, i.e
 ```js
 config = {
   out_trade_no: mika_transactionId
   out_refund_no: `ref${transactionId}`,
   refund_amount: 5000, // could be less than amount
   amount: 5000
 }
 ```
 *
 * return refund result object, i.e
 ```js
 altoRefundPayment = {
   result: 0 // Means Refund request ok
 }
 // or when failed, because repeated out_refund_no
 altoRefundPayment = {
   result: 1, // Means Refund request failed
   err_msg: 'cprefundid repeated',
   err_code: '707'
 }
 ```
 */
module.exports.altoRefundPayment = async function (config) {
  const request = {}
  request.mch_id = config.mch_id
  if (config.out_trade_no) {
    request.out_trade_no = config.out_trade_no
  } else if (config.trade_no) {
    request.trade_no = config.trade_no
  }
  request.out_refund_no = config.out_refund_no
  request.refund_amount = config.refund_amount
  request.amount = config.amount
  request.notify_url = config.notify_url // notify_url is optional parameter, but required for obvious reason

  return altoRequest(`${config.baseUrl}/mapi/pay/refund`, request, config)
}

/**
 * Query Refund payment (/mapi/pay/refund_query) to Alto config, i.e
 ```js
  config = {
    out_trade_no: transactionId
    out_refund_no: `ref${transactionId}`
  }
 ```
 return Payment status object, i.e
 ```js
  altoQueryRefundPayment = {
    currency: "IDR",
    refund_amount: "1000",
    refund_status: 1
  }
 ```
 */
module.exports.altoQueryRefundPayment = async function (config) {
  const request = {}
  request.mch_id = config.mch_id
  if (config.out_trade_no) {
    request.out_trade_no = config.out_trade_no
  } else if (config.trade_no) {
    request.trade_no = config.trade_no
  }
  request.out_refund_no = config.out_refund_no
  request.refund_amount = config.refund_amount
  request.amount = config.amount

  return altoRequest(`${config.baseUrl}/mapi/pay/refund_query`, request, config)
}
