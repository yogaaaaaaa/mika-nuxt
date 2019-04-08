'use strict'

/**
 * Helper to work with alto (alipay, wechatpay) payment gateway
 */

const crypto = require('crypto')
const request = require('superagent')

/**
 * Get Default base config object for altoPay/weChatPay

 * exports.baseConfig object is used in all alto related function.
 * In most function it will mixed with local config object
 */
module.exports.baseConfig = require('../configs/ppAltoConfig')

module.exports.mixConfig = (config) => {
  return Object.assign({}, exports.baseConfig, config)
}

/**
 * Convert object to uriEncoded string, doesn't support nested object
 * @param {Object} object
 * @return {String} uri encoded (query string encoded) string of object
 */
function objectToUriEncoded (object) {
  let component = []
  for (let property in object) {
    component.push(encodeURIComponent(`${property}=${object[property]}`))
  }
  return component.join('&')
}

/**
 * Create Object container used in every AltoPay API request, for more information
 * read AltoPay documentation
 * @param {Buffer} pemPrivateKey in PEM format
 * @param {String} data
 * @param {Boolean} encode when true, return data as urlEncoded string
 * @return {Object|String} return container as Object or uri encoded string
 */
function altoCreateContainer (pemPrivateKey, data, encode = false) {
  const signType = 'RSA'
  let sign = crypto.createSign('md5WithRSAEncryption')
    .update(Buffer.from(data, 'utf8'))
    .sign(pemPrivateKey)
    .toString('base64')

  let container = {
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
 * @param {Buffer} pemPublicKey
 * @param {Object} container
 * @returns {Boolean} Return true when container is valid with specified public key
 */
function altoVerifyContainer (pemPublicKey, container) {
  if (container.sign) {
    if (container.data) {
      return crypto.createVerify('md5WithRSAEncryption')
        .update(Buffer.from(container.data, 'utf8'))
        .verify(pemPublicKey, Buffer.from(container.sign, 'base64'))
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
 * @param {Object} config config object, contain pemPrivateKey and pemPublicKey
 * @returns {Object|null} When all is correct, it will return response data, else is null
 */
async function altoRequest (url, requestData, config) {
  let altoResponse = await request.post(url)
    .type('application/x-www-form-urlencoded')
    .send(altoCreateContainer(config.pemPrivateKey, JSON.stringify(requestData)))

  if (
    altoResponseCodeCorrect(altoResponse.body.code) &&
    altoVerifyContainer(config.pemAltoPublicKey, altoResponse.body)
  ) {
    return JSON.parse(altoResponse.body.data)
  } else {
    return null
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
 * @param {Object} config config object, It will be mixed with exports.baseConfig. Overwrite as necessary
 * @returns {Object|null} return transaction order object if all is correct, null otherwise
 */
module.exports.altoMakeQrCodePayment = async function (config) {
  config = exports.mixConfig(config)

  let requestData = {}
  requestData.mch_id = config.mch_id
  requestData.trade_type = 'QR_CODE'
  requestData.currency = config.currency
  requestData.out_trade_no = config.out_trade_no
  requestData.amount = config.amount
  requestData.subject = config.subject
  if (config.operator_id) { // Optional parameter
    requestData.operator_id = config.operator_id
  }
  requestData.notify_url = config.notify_url // notify_url is optional parameter, but required for obvious reason

  return altoRequest(`${config.baseUrl}/mapi/pay/order`, requestData, config)
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
 * @param {Object} config config object, at least include out_trade_no, It will be mixed with exports.baseConfig. Overwrite as necessary
 * @returns {Object|null} return transaction details object if all is correct, null otherwise
 */
module.exports.altoQueryPayment = async function (config) {
  config = exports.mixConfig(config)

  let requestData = {}
  requestData.mch_id = config.mch_id
  if (config.out_trade_no) {
    requestData.out_trade_no = config.out_trade_no
  } else if (config.trade_no) {
    requestData.trade_no = config.trade_no
  }

  return altoRequest(`${config.baseUrl}/mapi/pay/query`, requestData, config)
}

/**
 * Refund payment (/mapi/pay/refund) to Alto config, i.e
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
 * @param {Object} config config object, It will be mixed with exports.baseConfig. Overwrite as necessary
 * @returns {Object|null} return refund result object if all is correct, null otherwise
 */
module.exports.altoRefundPayment = async function (config) {
  config = exports.mixConfig(config)

  let requestData = {}
  requestData.mch_id = config.mch_id
  if (config.out_trade_no) {
    requestData.out_trade_no = config.out_trade_no
  } else if (config.trade_no) {
    requestData.trade_no = config.trade_no
  }
  requestData.out_refund_no = config.out_refund_no
  requestData.refund_amount = config.refund_amount
  requestData.amount = config.amount
  requestData.notify_url = config.notify_url // notify_url is optional parameter, but required for obvious reason

  return altoRequest(`${config.baseUrl}/mapi/pay/refund`, requestData, config)
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
 * @param {Object} config config object, It will be mixed with exports.baseConfig. Overwrite as necessary
 * @returns {Object|null} return refund details object if all is correct, null otherwise
 */
module.exports.altoQueryRefundPayment = async function (config) {
  config = exports.mixConfig(config)

  let requestData = {}
  requestData.mch_id = config.mch_id
  if (config.out_trade_no) {
    requestData.out_trade_no = config.out_trade_no
  } else if (config.trade_no) {
    requestData.trade_no = config.trade_no
  }
  requestData.out_refund_no = config.out_refund_no
  requestData.refund_amount = config.refund_amount
  requestData.amount = config.amount

  return altoRequest(`${config.baseUrl}/mapi/pay/refund_query`, requestData, config)
}
