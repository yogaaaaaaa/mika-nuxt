'use strict'

const config = require('configs/aqDanaConfig')
const debug = require('debug')('mika:dana:request')
const {
  createTransactionData,
  cancelTransactionData,
  queryTransactionData,
  refundTransactionData,
  createDivisionData,
  createShopData
} = require('./postData')
const { generateSignature, sendRequest } = require('./util')
const { generateUlid } = require('../uid')
const msg = require('../msg')

/**
 * Create Dana Transaction
 */
module.exports.createTransaction = async ctx => {
  const postData = createTransactionData(ctx)
  const signature = await generateSignature(postData.request)
  postData.signature = signature

  debug('Create transaction', JSON.stringify(postData, null, 2))
  const resp = await sendRequest(config.createQrisEndpoint, postData)
  debug('Create transaction response', JSON.stringify(resp, null, 2))

  return resp
}

/**
 * Cancel Dana Transaction
 */
module.exports.cancelTransaction = async ctx => {
  const postData = cancelTransactionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature

  debug('Cancel transaction', JSON.stringify(postData, null, 2))
  const resp = await sendRequest(config.cancelTransaction, postData)
  debug('Cancel transaction response', JSON.stringify(resp, null, 2))

  return resp
}

/**
 * Get transaction status
 */
module.exports.queryTransaction = async ctx => {
  const postData = queryTransactionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature

  debug('Query transaction', JSON.stringify(postData, null, 2))
  const resp = await sendRequest(config.queryTransaction, postData)
  debug('Query transaction response', JSON.stringify(resp, null, 2))

  return resp
}

/**
 * Refund Dana transaction
 */
module.exports.refundTransaction = async ctx => {
  const postData = refundTransactionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature

  debug('Refund transaction', JSON.stringify(postData, null, 2))
  const resp = await sendRequest(config.refundTransaction, postData)
  debug('Refund transaction response', JSON.stringify(resp, null, 2))

  return resp
}

/**
 * Create Dana Division
 */
module.exports.createDivision = async ctx => {
  const postData = createDivisionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature

  debug('Create division', JSON.stringify(postData, null, 2))
  const resp = sendRequest(config.createDivision, postData)
  debug('Create division response', JSON.stringify(resp, null, 2))

  return resp
}

/**
 * Create Dana Shop
 */
module.exports.createShop = async ctx => {
  const postData = createShopData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature

  debug('Create shop', JSON.stringify(postData, null, 2))
  const resp = await sendRequest(config.createShop, postData)
  debug('Create shop response', JSON.stringify(resp, null, 2))

  return resp
}

/**
 * Generate Dana Config
 */
const validateMerchant = async ({ crudCtx }) => {
  const { merchantId } = crudCtx.data

  if (!merchantId) {
    crudCtx.msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION
    crudCtx.response = ['merchantId']
    crudCtx.modelInstance = null
    return
  }

  const merchant = await crudCtx.models.merchant.findOne({
    where: {
      id: merchantId
    }
  })

  if (!merchant) {
    crudCtx.msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION
    crudCtx.response = ['unknown merchant']
    crudCtx.modelInstance = null
    return
  }

  const requiredMerchantParams = ['streetAddress', 'locality', 'district', 'city', 'province', 'taxCardNumber', 'icon']
  for (const key of requiredMerchantParams) {
    if (!merchant[key]) {
      crudCtx.msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION
      crudCtx.response = [`${key} is required`]
      crudCtx.modelInstance = null
      return
    }
  }

  if (merchant.taxCardNumber.length !== 15) {
    crudCtx.msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION
    crudCtx.response = ['taxCardNumber should be 15 characters']
    crudCtx.modelInstance = null
    return
  }

  return merchant
}

/**
 * Generate Division and Shop Id for Acquirer Config
 */
module.exports.generateDanaAcquirerConfig = async ({ crudCtx }) => {
  const merchant = await validateMerchant({ crudCtx })
  if (merchant) {
    const config = {
      externalDivisionId: generateUlid().base62mika,
      externalShopId: generateUlid().base62mika
    }

    let resultCode = ''

    // Dana Create Division
    const danaCreateDivisionResponse = await exports.createDivision({ merchant, ...config })
    resultCode = danaCreateDivisionResponse.response.body.resultInfo.resultCode
    if (resultCode !== 'SUCCESS') {
      crudCtx.msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION
      crudCtx.response = ['danaCreateDivision', danaCreateDivisionResponse.response.body.resultInfo.resultMsg]
      crudCtx.modelInstance = null
      return
    }

    config.divisionId = danaCreateDivisionResponse.response.body.divisionId

    // Dana Create Shop
    const danaCreateShopResponse = await exports.createShop({ merchant, ...config })
    resultCode = danaCreateShopResponse.response.body.resultInfo.resultCode
    if (!resultCode || resultCode !== 'SUCCESS') {
      crudCtx.msgType = msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION
      crudCtx.response = ['danaCreateShop', danaCreateDivisionResponse.response.body.resultInfo.resultMsg]
      crudCtx.modelInstance = null
      return
    }
    config.shopId = danaCreateShopResponse.response.body.shopId
    return config
  }
}
