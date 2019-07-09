'use strict'

/**
 * Helper to work with midtrans (gopay) payment gateway
 */

const crypto = require('crypto')
const superagent = require('superagent')

module.exports.handlerName = 'midtrans'
module.exports.handlerClasses = ['gopay']

module.exports.baseConfig = require('../configs/aqMidtransConfig')

function midtransRequestAgent (ctx) {
  const request = superagent
    .agent()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')
    .set('Authorization', ctx.midtransServerAuth)
  return request
}

module.exports.mixConfig = (config) => {
  let mixedConfig = Object.assign({}, exports.baseConfig, config)
  if (!mixedConfig.midtransServerAuth) {
    mixedConfig.midtransServerAuth = `Basic ${Buffer.from(`${mixedConfig.midtransServerKey}:`).toString('base64')}`
  }
  return mixedConfig
}

module.exports.gopayChargeRequest = async (ctx) => {
  let requestBody = {
    payment_type: 'gopay',
    transaction_details: {
      order_id: ctx.order_id,
      gross_amount: ctx.gross_amount
    }
  }
  if (ctx.email && ctx.fullname) {
    requestBody.customer_details = {
      fullname: ctx.fullname,
      email: ctx.email
    }
  }

  try {
    let request = midtransRequestAgent(ctx)
    if (ctx.notifUrl) {
      request.set('X-Override-Notification', ctx.notifUrl)
    }

    let response = await request
      .post(`${ctx.baseUrl}/v2/charge`)
      .send(requestBody)

    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

module.exports.expireTransaction = async (ctx) => {
  try {
    let response = await midtransRequestAgent(ctx)
      .post(`${ctx.baseUrl}/v2/${ctx.order_id || ctx.transactionId}/expire`)
      .send()
    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

module.exports.statusTransaction = async (ctx) => {
  try {
    let response = await midtransRequestAgent(ctx)
      .get(`${ctx.baseUrl}/v2/${ctx.order_id}/status`)
      .send()
    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}

module.exports.checkNotificationSignature = (ctx) => {
  let generatedSignature = crypto
    .createHash('sha512')
    .update(`${ctx.order_id}${ctx.status_code}${ctx.gross_amount}${ctx.midtransServerKey}`)
    .digest('hex')

  if (generatedSignature.toLowerCase() === ctx.signature_key.toLowerCase()) {
    return generatedSignature
  }
}
