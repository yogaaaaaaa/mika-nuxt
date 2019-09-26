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

exports.baseConfig = require('../configs/aqFairpayConfig')

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

function fairpayRequestAgent (ctx) {
  const request = superagent
    .agent()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')
  if (ctx.token) request.set('Authorization', `${ctx.auth_code} ${ctx.token}`)
  return request
}

function redisKey (...keys) {
  return `aqfairpay:${keys.reduce((acc, key) => `${acc}:${key}`)}`
}

module.exports.fairpayResponseCodes = {
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
  const notAuthCodes = [
    exports.fairpayResponseCodes.AUTH_NOT_LOGIN,
    exports.fairpayResponseCodes.AUTH_VALIDATION_FAILED,
    exports.fairpayResponseCodes.AUTH_BAD_TOKEN
  ]

  if (notAuthCodes.includes(resCode)) return resCode
}

module.exports.getToken = async (ctx) => {
  const token = await redis.get(redisKey(ctx.username, 'token'))
  if (token) {
    ctx.token = token
    return token
  }
}

module.exports.setToken = async (ctx) => {
  return redis.set(redisKey(ctx.username, 'token'), ctx.token)
}

module.exports.clearToken = async (ctx) => {
  ctx.token = null
  return redis.del(redisKey('token', ctx))
}

module.exports.createSaleRequest = (ctx) => {
  ctx.saleRequest = {}

  if (ctx.emvData) {
    if ((ctx.pinData || ctx.pinblockData) && !ctx.signatureData) {
      ctx.saleRequest.entry_mode = emv.posEntryMode.CHIP_WITH_PIN
    } else if (!(ctx.pinData || ctx.pinblockData) && ctx.signatureData) {
      ctx.saleRequest.entry_mode = emv.posEntryMode.CHIP_WITH_SIGNATURE
    } else {
      ctx.saleRequest.entry_mode = emv.posEntryMode.CHIP_WITH_OFFLINE_PIN
    }
  } else {
    if (ctx.track2Data && (ctx.pinData || ctx.pinblockData) && !ctx.signatureData) {
      ctx.saleRequest.entry_mode = emv.posEntryMode.MAGSTRIPE_WITH_PIN
    } else if (ctx.track2Data && !(ctx.pinData || ctx.pinblockData) && ctx.signatureData) {
      ctx.saleRequest.entry_mode = emv.posEntryMode.MAGSTRIPE_WITH_SIGNATURE
    }
  }

  if (!ctx.saleRequest.entry_mode || !ctx.amount) return

  ctx.saleRequest.device_timestamp = '0'

  ctx.saleRequest.base_amount = String(ctx.amount).padStart(10, '0')
  ctx.saleRequest.tip_amount = '0'
  ctx.saleRequest.device_id = ctx.device_id

  // randomize all counter
  ctx.pin_ksn = emv.ksnCounterRandomize(ctx.pin_ksn)
  ctx.emv_ksn = emv.ksnCounterRandomize(ctx.emv_ksn)
  ctx.track_ksn = emv.ksnCounterRandomize(ctx.track_ksn)

  ctx.emvTags = null

  if (ctx.emvData) {
    ctx.emvTags = emv.tlvDecode(ctx.emvData)

    // Verify base amount
    // let baseAmount = parseInt(common.tlvTagFind('9F02', emvTlv))

    // Encrypt EMV data
    ctx.saleRequest.emv_ksn_index = emv.ksnCounterGet(ctx.emv_ksn)
    ctx.saleRequest.emv_req_len = ctx.emvData.length
    ctx.saleRequest.emv_req_enc = emv.encrypt3DESDataWithIPEK(
      ctx.emv_ipek,
      ctx.emv_ksn,
      emv.evenAndPadHexstring(ctx.emvData)
    )
    // Get track2 from emv
    ctx.track2Data = emv.track2RemoveSymbol(emv.tlvTagFind(emv.emvTags.TRACK_2_EQUIVALENT_DATA, ctx.emvTags))
  } else {
    // Get track2 data
    ctx.track2Data = emv.track2RemoveSymbol(ctx.track2Data)
  }

  ctx.cardPan = emv.track2GetPAN(ctx.track2Data)
  const panComponent = ctx.cardPan.match(/(\d{6})(.*)(\d{4})/)
  ctx.cardPanMasked = `${panComponent[1]}${'*'.repeat(panComponent[2].length)}${panComponent[3]}`
  ctx.cardBin = panComponent[1]
  // TODO: WARNING ! INACCURATE ! Replace ASAP !
  ctx.cardIssuer = null
  if (ctx.cardBin[0] === '4') ctx.cardNetwork = 'visa'
  if (ctx.cardBin[0] === '5') ctx.cardNetwork = 'mastercard'

  // Encrypt pin data (if exist)
  if (ctx.pinData || ctx.pinblockData) {
    if (ctx.pinData) {
      ctx.pinblockData = emv.generateISO0Pinblock(
        ctx.cardPan,
        ctx.pinData
      )
    }
    ctx.saleRequest.pin_ksn_index = emv.ksnCounterGet(ctx.pin_ksn)
    ctx.saleRequest.pinblock_enc = emv.encrypt3DESDataWithIPEK(
      ctx.pin_ipek,
      ctx.pin_ksn,
      ctx.pinblockData
    )
  }

  // Encrypt track2 data
  ctx.saleRequest.track_ksn_index = emv.ksnCounterGet(ctx.track_ksn)
  ctx.saleRequest.track_2_len = String(ctx.track2Data.length)
  ctx.saleRequest.track_2_hash = hashSHA512(ctx.track2Data)
  ctx.saleRequest.track_2_enc = emv.encrypt3DESDataWithIPEK(ctx.track_ipek, ctx.track_ksn, emv.evenAndPadHexstring(ctx.track2Data))
  return ctx.saleRequest
}

module.exports.processSaleResponse = async (ctx) => {
  if (!ctx.saleResponse) return

  if (ctx.saleResponse.emv_res_enc) {
    ctx.emvDataResponse = emv.decrypt3DESDataWithIPEK(
      ctx.emv_ipek,
      emv.ksnCounterSet(ctx.emv_ksn, ctx.saleResponse.emv_ksn_index),
      ctx.saleResponse.emv_res_enc
    ).substring(0, ctx.saleResponse.emv_res_len)
  }
  return ctx.emvDataResponse
}

module.exports.apiLogin = async (ctx) => {
  const timestamp = getUnixTimestamp()

  const response = await (fairpayRequestAgent(ctx))
    .post(`${ctx.baseUrl}/MerchantMobAppHost/v1/login`)
    .send({
      username: ctx.username,
      pass_hash: getFairpayPassHash(timestamp, ctx.password),
      device_timestamp: timestamp
    })

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCodes.LOGIN_SUCCESS) {
      ctx.token = response.body.token
      await exports.setToken(ctx)
    }
    return response.body
  }
}

module.exports.apiLogout = async (ctx) => {
  if (!ctx.token) return

  const timestamp = getUnixTimestamp()

  const response = await (fairpayRequestAgent(ctx))
    .post(`${ctx.baseUrl}/MerchantMobAppHost/v1/logout`)
    .send({
      username: ctx.username,
      pass_hash: getFairpayPassHash(timestamp, ctx.password),
      device_timestamp: timestamp
    })

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCodes.LOGOUT_SUCCESS) {
      ctx.token = response.body.token
      await exports.clearToken(ctx)
    }
    return response.body
  }
}

module.exports.apiDebitCreditSale = async (ctx) => {
  if (!ctx.token || !ctx.saleRequest) return

  ctx.saleRequest.device_timestamp = getUnixTimestamp()

  const response = await (fairpayRequestAgent(ctx))
    .post(`${ctx.baseUrl}/MerchantMobAppHost/v1/debit_credit/sale/sale_trx`)
    .send(ctx.saleRequest)

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCodes.SALE_APPROVED) {
      ctx.saleResponse = response.body
    }
    return response.body
  }
}

module.exports.apiDebitCreditCheck = async (ctx) => {
  if (!ctx.token || !ctx.saleRequest) return

  ctx.saleRequest.device_timestamp = getUnixTimestamp()

  const response = await (fairpayRequestAgent(ctx))
    .post(`${ctx.baseUrl}/MerchantMobAppHost/v1/debit_credit/sale/is_debit_check`)
    .send(ctx.saleRequest)

  if (response.body) {
    if (response.body.response_code === exports.fairpayResponseCodes.CHECK_PROCESS_SUCCESS) {
      ctx.cardType = response.body.is_debit_flag ? 'debit' : 'credit'
    }
    return response.body
  }
}

module.exports.apiSaveSignature = async (ctx) => {
  if (!ctx.saleResponse || !ctx.signatureData || !ctx.token) return

  const request = {
    device_timestamp: getUnixTimestamp(),
    invoice_num: ctx.saleResponse.invoice_num,
    approval_code: ctx.saleResponse.approval_code,
    rrn: ctx.saleResponse.rrn,
    customer_signature: ctx.signatureData
  }

  const response = await (fairpayRequestAgent(ctx))
    .post(`${ctx.baseUrl}/MerchantMobAppHost/v1/debit_credit/sale/save_customer_signature`)
    .send(request)

  if (response.body) {
    if (
      response.body.response_code === exports.fairpayResponseCodes.RECEIPT_FIRST_COPY ||
      response.body.response_code === exports.fairpayResponseCodes.RECEIPT_DUPLICATE_COPY
    ) {
      ctx.saveSignatureResponse = response.body
    }
    return response.body
  }
}

module.exports.processAuthAndApi = async (apiRequestFunction, ctx, apiNumTry = 2) => {
  while (apiNumTry) {
    const apiResponse = await apiRequestFunction(ctx)
    const apiResCode = exports.getFairpayResponseCode(apiResponse)

    if (exports.isFairpayResponseCodeNotAuth(apiResCode)) {
      await exports.apiLogin(ctx)
    } else {
      return apiResponse
    }
    apiNumTry--
  }
}
