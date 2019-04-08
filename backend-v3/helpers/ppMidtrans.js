'use strict'

/**
 * Helper to work with midtrans (gopay) payment gateway
 */

const crypto = require('crypto')

const superagent = require('superagent')

module.exports.baseConfig = require('../configs/ppMidtransConfig')

function midtransRequestAgent (config) {
  const request = superagent
    .agent()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')
    .set('Authorization', config.serverAuth)
  return request
}

module.exports.mixConfig = (config) => {
  return Object.assign({}, exports.baseConfig, config)
}

module.exports.gopayChargeRequest = async (config) => {
  config = exports.mixConfig(config)

  let requestBody = {
    payment_type: 'gopay',
    transaction_details: {
      order_id: config.order_id || config.transactionId,
      gross_amount: config.gross_amount || config.amount
    }
  }
  if (config.email && config.fullname) {
    requestBody.customer_details = {
      fullname: config.fullname,
      email: config.email
    }
  }

  try {
    let response = await midtransRequestAgent(config)
      .post(`${config.baseUrl}/v2/charge`)
      .send(requestBody)

    if (response.body) {
      return response.body
    } else {
      return null
    }
  } catch (err) {
    return null
  }
}

module.exports.expireTransaction = async (config) => {
  config = exports.mixConfig(config)

  try {
    let response = await midtransRequestAgent(config)
      .post(`${config.baseUrl}/v2/${config.order_id || config.transactionId}/expire`)
      .send()

    if (response.body) {
      return response.body
    } else {
      return null
    }
  } catch (err) {
    return null
  }
}

module.exports.statusTransaction = async (config) => {
  config = exports.mixConfig(config)

  try {
    let response = await midtransRequestAgent(config)
      .get(`${config.baseUrl}/v2/${config.order_id || config.transactionId}/status`)
      .send()

    if (response.body) {
      return response.body
    } else {
      return null
    }
  } catch (err) {
    return null
  }
}

module.exports.checkNotificationSignature = (signature, config) => {
  config = exports.mixConfig(config)
  let generatedSignature = crypto
    .createHash('sha512')
    .update(`${config.order_id || config.transactionId}${config.status_code}${config.gross_amount || config.amount}${config.serverKey}`)
    .digest('hex')

  if (generatedSignature.toLowerCase() === signature.toLowerCase()) {
    return generatedSignature
  } else {
    return null
  }
}
