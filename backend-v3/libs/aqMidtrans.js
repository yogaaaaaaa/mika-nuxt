'use strict'

/**
 * Helper to work with midtrans (gopay) payment gateway
 */

const crypto = require('crypto')
const superagent = require('superagent')

module.exports.handlerName = 'midtrans'
module.exports.handlerClasses = ['gopay']

module.exports.baseConfig = require('../configs/aqMidtransConfig')

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
  let mixedConfig = Object.assign({}, exports.baseConfig, config)
  if (!mixedConfig.midtransServerAuth) {
    mixedConfig.midtransServerAuth = `Basic ${Buffer.from(`${mixedConfig.midtransServerKey}:`)}`
  }
  return mixedConfig
}

module.exports.gopayChargeRequest = async (config) => {
  let requestBody = {
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
    let request = midtransRequestAgent(config)
    if (config.notifUrl) {
      request.set('X-Override-Notification', config.notifUrl)
    }

    let response = await request
      .post(`${config.baseUrl}/v2/charge`)
      .send(requestBody)

    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

module.exports.expireTransaction = async (config) => {
  try {
    let response = await midtransRequestAgent(config)
      .post(`${config.baseUrl}/v2/${config.order_id || config.transactionId}/expire`)
      .send()

    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

module.exports.statusTransaction = async (config) => {
  try {
    let response = await midtransRequestAgent(config)
      .get(`${config.baseUrl}/v2/${config.order_id}/status`)
      .send()

    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

module.exports.checkNotificationSignature = (config) => {
  let generatedSignature = crypto
    .createHash('sha512')
    .update(`${config.order_id}${config.status_code}${config.gross_amount}${config.midtransServerKey}`)
    .digest('hex')

  if (generatedSignature.toLowerCase() === config.signature_key.toLowerCase()) {
    return generatedSignature
  }
}
