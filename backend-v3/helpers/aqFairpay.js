'use strict'

/**
 * Helper to work with fairpay middleware
 */

const crypto = require('crypto')
const superagent = require('superagent')
const emv = require('./emv')
const redis = require('./redis')

module.exports.handlerName = 'fairpay'
module.exports.handlerClasses = ['emvDebit', 'emvCredit']

exports.baseConfig = require('../configs/ppFairpayConfig')

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

  if (config.token) request.set('Authorization', `${config.auth_code} ${config.token}`)

  return request
}

function redisKey (key, config) {
  return `ppfairpay:${config.username}:${key}`
}

module.exports.responseCodes = {
  LOGIN_SUCCESS: '0000',
  LOGOUT_SUCCESS: '0001',
  RECEIPT_FIRST_COPY: '0040',
  RECEIPT_DUPLICATE_COPY: '0041',
  SALE_APPROVED: '0020',
  AUTH_NOT_LOGIN: '0F20',
  AUTH_VALIDATION_FAILED: '0F40',
  AUTH_BAD_TOKEN: '0F10',
  CHECK_PROCESS_SUCCESS: '00A0'
}

module.exports.mixConfig = (config) => {
  return Object.assign({}, exports.baseConfig, config)
}

module.exports.getFairpayResponseCode = (response) => {
  if (response) {
    if (response.response_code) {
      return response.response_code
    }
  }
}

module.exports.isFairpayResponseCodeNotAuth = (resCode) => {
  let notAuthCodes = [
    exports.responseCodes.AUTH_NOT_LOGIN,
    exports.responseCodes.AUTH_VALIDATION_FAILED,
    exports.responseCodes.AUTH_BAD_TOKEN
  ]

  if (notAuthCodes.includes(resCode)) return resCode
}

module.exports.getToken = async (config) => {
  let token = await redis.get(redisKey('token', config))
  if (token) {
    config.token = token
    return token
  }
}

module.exports.setToken = async (config) => {
  return redis.set(redisKey(`token`, config), config.token)
}

module.exports.clearToken = async (config) => {
  config.token = null
  return redis.del(redisKey(`token`, config))
}

module.exports.createSaleRequest = (config) => {
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

  if (!config.saleRequest.entry_mode || !config.amount) return

  config.saleRequest.device_timestamp = '0'

  config.saleRequest.base_amount = String(config.amount).padStart(10, '0')
  config.saleRequest.tip_amount = '0'
  config.saleRequest.device_id = config.device_id

  // randomize all counter
  config.pin_ksn = emv.ksnCounterRandomize(config.pin_ksn)
  config.emv_ksn = emv.ksnCounterRandomize(config.emv_ksn)
  config.track_ksn = emv.ksnCounterRandomize(config.track_ksn)

  config.emvTags = null
  config.track2Data = null

  if (config.emvData) {
    config.emvTags = emv.tlvDecode(config.emvData)

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
    config.track2Data = emv.track2RemoveSymbol(emv.tlvTagFind(emv.emvTags.TRACK_2_EQUIVALENT_DATA, config.emvTags))
  } else {
    // Get track2 data
    config.track2Data = emv.track2RemoveSymbol(config.track2Data)
  }

  config.cardPan = emv.track2GetPAN(config.track2Data)
  let panComponent = config.cardPan.match(/(\d{6})(.*)(\d{4})/)
  config.cardPanMasked = `${panComponent[1]}${'*'.repeat(panComponent[2].length)}${panComponent[3]}`
  config.cardBin = panComponent[1]
  // TODO: WARNING ! INACCURATE ! Replace ASAP !
  config.cardIssuer = null
  if (config.cardBin[0] === '4') config.cardNetwork = 'visa'
  if (config.cardBin[0] === '5') config.cardNetwork = 'mastercard'

  // Encrypt pinblock (if exist)
  if (config.pinData) {
    config.saleRequest.pin_ksn_index = emv.ksnCounterGet(config.pin_ksn)
    config.saleRequest.pinblock_enc = emv.encrypt3DESDataWithIPEK(
      config.pin_ipek,
      config.pin_ksn,
      emv.generateISO0Pinblock(
        config.cardPan,
        config.pinData
      )
    )
  }

  // Encrypt track2 data
  config.saleRequest.track_ksn_index = emv.ksnCounterGet(config.track_ksn)
  config.saleRequest.track_2_len = String(config.track2Data.length)
  config.saleRequest.track_2_hash = hashSHA512(config.track2Data)
  config.saleRequest.track_2_enc = emv.encrypt3DESDataWithIPEK(config.track_ipek, config.track_ksn, emv.evenAndPadHexstring(config.track2Data))
  return config.saleRequest
}

module.exports.processSaleResponse = async (config) => {
  if (!config.saleResponse) return

  if (config.saleResponse.emv_res_enc) {
    config.emvDataResponse = emv.decrypt3DESDataWithIPEK(
      config.emv_ipek,
      emv.ksnCounterSet(config.emv_ksn, config.saleResponse.emv_ksn_index),
      config.saleResponse.emv_res_enc
    ).substring(0, config.saleResponse.emv_res_len)
  }
  return config.emvDataResponse
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
      await exports.setToken(config)
    }
    return response.body
  }
}

module.exports.apiLogout = async (config) => {
  if (!config.token) return

  let timestamp = getUnixTimestamp()

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
      await exports.clearToken(config)
    }
    return response.body
  }
}

module.exports.apiDebitCreditSale = async (config) => {
  if (!config.token || !config.saleRequest) return

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
}

module.exports.apiDebitCreditCheck = async (config) => {
  if (!config.token || !config.saleRequest) return

  config.saleRequest.device_timestamp = getUnixTimestamp()

  let response = await (fairpayRequestAgent(config))
    .post(`${config.baseUrl}/MerchantMobAppHost/v1/debit_credit/sale/is_debit_check`)
    .send(config.saleRequest)

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCode.CHECK_PROCESS_SUCCESS) {
      config.cardType = response.body.is_debit_flag ? 'debit' : 'credit'
    }
    return response.body
  }
}

module.exports.apiSaveSignature = async (config) => {
  if (!config.saleResponse || !config.signatureData || !config.token) return

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
    if (
      response.body.response_code === exports.responseCodes.RECEIPT_FIRST_COPY ||
      response.body.response_code === exports.responseCodes.RECEIPT_DUPLICATE_COPY
    ) {
      config.saveSignatureResponse = response.body
    }
    return response.body
  }
}

module.exports.processAuthAndApi = async (apiRequestFunction, config, apiNumTry = 2) => {
  await exports.apiAuthInit(config)

  while (apiNumTry) {
    let apiResponse = await apiRequestFunction(config)
    let apiResCode = exports.getFairpayResponseCode(apiResponse)

    if (exports.isFairpayResponseCodeNotAuth(apiResCode)) {
      await exports.apiLogin(config)
    } else {
      return apiResponse
    }
    apiNumTry--
  }
}
