'use strict'

/**
 * Helper to work with fairpay middleware
 */

const crypto = require('crypto')

const baseConfig = require('../config/ppFairpayConfig')
const superagent = require('superagent')
const emv = require('./emv')

const redis = require('./redis')

exports.baseConfig = baseConfig

/**
 * Does exactly what it says on the tin
 */
function getUnixTimestamp () {
  return String(Math.floor(Date.now() / 1000))
}

/**
 * THIS IS HASH !!!
 */
function hashSHA512 (data) {
  return crypto.createHash('sha512').update(data).digest('hex')
}

/**
 * Fairpay-style password hash
 */
function getFairpayPassHash (timestamp, password) {
  return crypto.createHash('sha256').update(
    `${timestamp}${crypto.createHash('md5').update(password).digest('hex')}`
  ).digest('hex')
}

function fairpayRequestAgent (config) {
  const request = superagent
    .agent()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')

  if (config.token) {
    request.set('Authorization', `${config.auth_code} ${config.token}`)
  }
  return request
}

module.exports.fairpayResponseCode = {
  LOGIN_SUCCESS: '0000',
  LOGOUT_SUCCESS: '0001',
  RECEIPT_FIRST_COPY: '0040',
  RECEIPT_DUPLICATE_COPY: '0041',
  SALE_APPROVED: '0020',
  AUTH_NOT_LOGIN: '0F20',
  AUTH_VALIDATION_FAILED: '0F40',
  AUTH_BAD_TOKEN: '0F10'
}

module.exports.mixConfig = (config) => {
  return Object.assign({}, exports.baseConfig, config)
}

module.exports.getToken = async (config) => {
  let token = await redis.get(`${config.redisPrefix}:fp_token`)
  if (token) {
    config.token = token
    return true
  }
  return false
}

module.exports.setToken = async (config) => {
  await redis.set(`${config.redisPrefix}:fp_token`, config.token)
}

module.exports.createSaleRequest = (config) => {
  try {
    config.saleRequest = {}

    if (config.emvData) {
      if (config.pinData && !config.signatureData) {
        config.saleRequest.entry_mode = emv.posEntryMode.CHIP_WITH_PIN
      } else if (!config.pinData && config.signatureData) {
        config.saleRequest.entry_mode = emv.posEntryMode.CHIP_WITH_SIGNATURE
      } else {
        config.saleRequest.entry_mode = emv.posEntryMode.CHIP_WITH_OFFLINE_PIN
      }
    } else {
      if (config.track2Data && config.pinData && !config.signatureData) {
        config.saleRequest.entry_mode = emv.posEntryMode.MAGSTRIPE_WITH_PIN
      } else if (config.track2Data && !config.pinData && config.signatureData) {
        config.saleRequest.entry_mode = emv.posEntryMode.MAGSTRIPE_WITH_SIGNATURE
      }
    }

    if (
      !config.saleRequest.entry_mode ||
    !config.amount
    ) {
      return false
    }

    config.saleRequest.device_timestamp = '0'

    config.saleRequest.base_amount = String(config.amount).padStart(10, '0')
    config.saleRequest.tip_amount = '0'
    config.saleRequest.device_id = config.device_id

    // randomize all counter
    config.pin_ksn = emv.ksnCounterRandomize(config.pin_ksn)
    config.emv_ksn = emv.ksnCounterRandomize(config.emv_ksn)
    config.track_ksn = emv.ksnCounterRandomize(config.track_ksn)

    let emvTags = null
    let track2Data = null

    if (config.emvData) {
      emvTags = emv.tlvDecode(config.emvData)

      // Verify base amount
      // let baseAmount = parseInt(common.tlvTagFind('9F02', emvTlv))

      // Encrypt EMV data
      config.saleRequest.emv_ksn_index = emv.ksnCounterGet(config.emv_ksn)
      config.saleRequest.emv_req_len = config.emvData.length
      config.saleRequest.emv_req_enc = emv.encrypt3DESDataWithIPEK(
        config.emv_ipek,
        config.emv_ksn,
        emv.evenAndPadHexstring(config.emvData)
      )
      // Get track2 from emv
      track2Data = emv.track2RemoveSymbol(emv.tlvTagFind(emv.emvTags.TRACK_2_EQUIVALENT_DATA, emvTags))
    } else {
    // Get track2 data
      track2Data = emv.track2RemoveSymbol(config.track2Data)
    }

    // Encrypt pinblock (if exist)
    if (config.pinData) {
      config.saleRequest.pin_ksn_index = emv.ksnCounterGet(config.pin_ksn)
      config.saleRequest.pinblock_enc = emv.encrypt3DESDataWithIPEK(
        config.pin_ipek,
        config.pin_ksn,
        emv.generateISO0Pinblock(
          track2Data.substring(0, track2Data.indexOf('D')),
          config.pinData
        )
      )
    }

    // Encrypt track2 data
    config.saleRequest.track_ksn_index = emv.ksnCounterGet(config.track_ksn)
    config.saleRequest.track_2_len = String(track2Data.length)
    config.saleRequest.track_2_hash = hashSHA512(track2Data)
    config.saleRequest.track_2_enc = emv.encrypt3DESDataWithIPEK(config.track_ipek, config.track_ksn, emv.evenAndPadHexstring(track2Data))
  } catch (error) {
    return false
  }
  return true
}

module.exports.processSaleResponse = async (config) => {
  try {
    if (!config.saleResponse) {
      return false
    }

    if (config.saleResponse.emv_res_enc) {
      config.emvDataResponse = emv.decrypt3DESDataWithIPEK(
        config.emv_ipek,
        emv.ksnCounterSet(config.emv_ksn, config.saleResponse.emv_ksn_index),
        config.saleResponse.emv_res_enc
      ).substring(0, config.saleResponse.emv_res_len)
    }
  } catch (error) {
    return false
  }

  return true
}

module.exports.getFairpayResponseCode = (response) => {
  if (response) {
    if (response.response_code) {
      return response.response_code
    }
  }
}

module.exports.apiLogin = async (config) => {
  let timestamp = getUnixTimestamp()

  let response = await (fairpayRequestAgent(config))
    .post(`${config.baseUrl}/MerchantMobAppHost/v1/login`)
    .send({
      username: config.username,
      pass_hash: getFairpayPassHash(timestamp, config.password),
      device_timestamp: timestamp
    })

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCode.LOGIN_SUCCESS) {
      config.token = response.body.token
    }
    return response.body
  }

  return null
}

module.exports.apiLogout = async (config) => {
  let timestamp = getUnixTimestamp()

  if (!config.token) {
    return null
  }

  let response = await (fairpayRequestAgent(config))
    .post(`${config.baseUrl}/MerchantMobAppHost/v1/logout`)
    .send({
      username: config.username,
      pass_hash: getFairpayPassHash(timestamp, config.password),
      device_timestamp: timestamp
    })

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCode.LOGOUT_SUCCESS) {
      config.token = response.body.token
    }
    return response.body
  }

  return null
}

module.exports.apiDebitCreditSale = async (config) => {
  if (!config.token) {
    return null
  }

  if (!config.saleRequest) {
    return null
  }

  config.saleRequest.device_timestamp = getUnixTimestamp()

  let response = await (fairpayRequestAgent(config))
    .post(`${config.baseUrl}/MerchantMobAppHost/v1/debit_credit/sale/sale_trx`)
    .send(config.saleRequest)

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCode.SALE_APPROVED) {
      config.saleResponse = response.body
    }
    return response.body
  }

  return null
}

module.exports.apiSaveSignature = async (config) => {
  if (!config.token) {
    return null
  }

  if (!config.saleResponse || !config.signatureData) {
    return null
  }

  let request = {
    device_timestamp: getUnixTimestamp(),
    invoice_num: config.saleResponse.invoice_num,
    approval_code: config.saleResponse.approval_code,
    rrn: config.saleResponse.rrn,
    customer_signature: config.signatureData
  }

  let response = await (fairpayRequestAgent(config))
    .post(`${config.baseUrl}/MerchantMobAppHost/v1/debit_credit/sale/save_customer_signature`)
    .send(request)

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCode.RECEIPT_FIRST_COPY || exports.fairpayResponseCode.RECEIPT_DUPLICATE_COPY) {
      config.saveSignatureResponse = response.body
    }
    return response.body
  }

  return null
}
