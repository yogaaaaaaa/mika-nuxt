'use strict'

/**
 * Helper to work with tcash national qr code version
 */

const crypto = require('crypto')
const superagent = require('superagent')
const format = require('../libs/format')

module.exports.handlerName = 'tcashqrn'
module.exports.handlerClasses = ['qris']

module.exports.baseConfig = require('../configs/aqTcashQrnConfig')

function tcashQrnGetAgent (config) {
  const agent = superagent
    .agent()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')
  return agent
}

function tcashQrnSetAuthOnAgent (agent, config) {
  agent._data = JSON.stringify(agent._data)
  const signatureData = `${config.tcashQrnCid}:${agent._data}:${config.tcashQrnSecretKey}`
  const signature = crypto
    .createHmac('sha512', config.tcashQrnSecretKey)
    .update(signatureData, 'utf8')
    .digest('hex')
  agent.set('cid', config.tcashQrnCid)
  agent.set('signature', signature)
  return agent
}

module.exports.notifResponseMsg = {
  SUCCESS: {
    responseCode: '00'
  },

  BAD_REQUEST: {
    responseCode: '40'
  },

  UNAUTHORIZED: {
    responseCode: '41'
  },

  INVALID_TRANSACTION: {
    responseCode: '44',
    notificationMessage: 'Invalid transaction, please ask merchant to create transaction again'
  },
  INVALID_AMOUNT: {
    responseCode: '45',
    notificationMessage: 'Transaction is rejected, please do not include any tip in your payment'
  },

  SERVER_ERROR: {
    responseCode: '50',
    notificationMessage: 'Cannot process transaction due to server error'
  }
}

module.exports.mixConfig = (config) => {
  let mixedConfig = Object.assign({}, exports.baseConfig, config)
  return mixedConfig
}

module.exports.generateTcashNationalQr = async (config) => {
  let requestBody = {
    fee: format.decimalAmountPadded(config.fee, 12),
    amount: format.decimalAmountPadded(config.amount, 12),

    merchantID: config.tcashQrnMerchantID,
    merchantCriteria: config.tcashQrnMerchantCriteria || 'UMI',

    city: config.city || '-',
    postalCode: config.postalCode || '-',
    merchantName: config.merchantName || '-',

    merchantPan: `${config.tcashQrnMerchantPanPrefix}${config.tcashQrnMerchantID.slice(-8)}`,
    partnerMerchantID: config.partnerMerchantID || undefined,

    merchantTrxID: config.merchantTrxID
  }

  try {
    let agent = tcashQrnGetAgent(config)
      .post(`${config.baseUrl}/api/v1/trx/qr/generate`)
      .send(requestBody)
    tcashQrnSetAuthOnAgent(agent, config)

    let response = await agent

    if (response.body) return response.body
  } catch (err) {
    console.error(err)
  }
}
