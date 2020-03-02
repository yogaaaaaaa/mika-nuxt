'use strict'

/**
 * Helper to work with midtrans (gopay) payment gateway
 */

const crypto = require('crypto')
const superagent = require('superagent')
const htmlParser = require('node-html-parser')

module.exports.baseConfig = require('../configs/aqMidtransConfig')
module.exports.handlerName = 'midtrans'

function midtransRequestAgent (config) {
  const request = superagent
    .agent()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')
    .set('Authorization', config.midtransServerAuth)
  return request
}

module.exports.mixConfig = (config) => {
  const mixedConfig = Object.assign({}, exports.baseConfig, config)
  if (!mixedConfig.midtransServerAuth) {
    mixedConfig.midtransServerAuth = `Basic ${Buffer.from(`${mixedConfig.midtransServerKey}:`).toString('base64')}`
  }
  return mixedConfig
}

/**
 * Create gopay change request
 *
 * See: https://api-docs.midtrans.com/#charge-features
 */
module.exports.gopayChargeRequest = async (config) => {
  const requestBody = {
    payment_type: 'gopay',
    transaction_details: {
      order_id: config.order_id,
      gross_amount: config.gross_amount
    }
  }
  if (config.email && config.fullname) {
    requestBody.customer_details = {
      fullname: config.fullname,
      email: config.email
    }
  }

  try {
    const request = midtransRequestAgent(config)
    if (config.notifUrl) {
      request.set('X-Override-Notification', config.notifUrl)
    }

    const response = await request
      .post(`${config.baseUrl}/v2/charge`)
      .send(requestBody)

    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

/**
 * Cancel midtrans transaction
 *
 * See: https://api-docs.midtrans.com/#cancel-transaction
 */
module.exports.cancelTransaction = async (config) => {
  try {
    const response = await midtransRequestAgent(config)
      .post(`${config.baseUrl}/v2/${config.order_id}/cancel`)
      .send()
    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

/**
 * Direct refund midtrans transaction
 *
 * See: https://api-docs.midtrans.com/#direct-refund-transaction
 */
module.exports.directRefundTransaction = async (config) => {
  try {
    const requestBody = {
      amount: config.amount
    }
    if (config.reason) {
      requestBody.reason = config.reason
    }
    if (config.refund_key) {
      requestBody.refund_key = config.refund_key
    }

    const response = await midtransRequestAgent(config)
      .post(`${config.baseUrl}/v2/${config.order_id}/refund/online/direct`)
      .send(requestBody)
    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

/**
 * Expire midtrans transaction
 *
 * See: https://api-docs.midtrans.com/#expire-transaction
 */
module.exports.expireTransaction = async (config) => {
  try {
    const response = await midtransRequestAgent(config)
      .post(`${config.baseUrl}/v2/${config.order_id}/expire`)
      .send()
    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

/**
 * Check status of midtrans transaction
 *
 * See: https://api-docs.midtrans.com/#get-transaction-status
 */
module.exports.statusTransaction = async (config) => {
  try {
    const response = await midtransRequestAgent(config)
      .get(`${config.baseUrl}/v2/${config.order_id}/status`)
      .send()
    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

/**
 * Check validity of signature notification from midtrans
 *
 * See: https://api-docs.midtrans.com/#receiving-notifications
 */
module.exports.checkNotificationSignature = (config) => {
  const generatedSignature = crypto
    .createHash('sha512')
    .update(`${config.order_id}${config.status_code}${config.gross_amount}${config.midtransServerKey}`)
    .digest('hex')

  if (generatedSignature.toLowerCase() === config.signature_key.toLowerCase()) {
    return generatedSignature
  }
}

/**
 * Make gopay payment success in sandbox/development environment
 * via https://simulator.sandbox.midtrans.com/gopay/ui/parse/index.html
 */
module.exports.gopaySandboxPay = async (config) => {
  try {
    const parseResponse = await superagent
      .post(`${config.sandboxBaseUrl}/gopay/ui/parse`)
      .type('form')
      .send({
        qrCodeUrl: config.qrCodeUrl
      })
    const htmlParseResponse = htmlParser.parse(parseResponse.text)

    const payResponse = await superagent
      .post(`${config.sandboxBaseUrl}/gopay/ui/payment`)
      .type('form')
      .send({
        reference_id: htmlParseResponse.querySelector('#referenceId').attributes.value,
        callback_url: htmlParseResponse.querySelector('#callbackUrl').attributes.value,
        result: 'true'
      })
    const htmlPayResponse = htmlParser.parse(payResponse.text)

    const isPaySuccess = htmlPayResponse.querySelector('.container').toString().includes('GO-PAY Payment success')

    return isPaySuccess
  } catch (err) {
    console.error(err)
  }
}
