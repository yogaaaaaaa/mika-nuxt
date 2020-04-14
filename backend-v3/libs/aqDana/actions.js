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
  debug('Create Qris Post Data', JSON.stringify(postData))
  const resp = await sendRequest(config.createQrisEndpoint, postData)
  return resp
}

/**
 * Cancel Dana Transaction
 */
module.exports.cancelTransaction = async ctx => {
  const postData = cancelTransactionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature
  debug('Cancel Post Data', JSON.stringify(postData))
  return sendRequest(config.cancelTransaction, postData)
}

/**
 * Get transaction status
 */
module.exports.queryTransaction = async ctx => {
  const postData = queryTransactionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature
  debug('queryTransaction Post Data', JSON.stringify(postData))

  return sendRequest(config.queryTransaction, postData)
}

/**
 * Refund Dana transaction
 */
module.exports.refundTransaction = async ctx => {
  const postData = refundTransactionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature
  debug('refundTransaction Post Data', JSON.stringify(postData))

  return sendRequest(config.refundTransaction, postData)
}

/**
 * Create Dana Division
 */
module.exports.createDivision = async ctx => {
  const postData = createDivisionData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature
  debug('createDivision Post Data: ', JSON.stringify(postData))
  return sendRequest(config.createDivision, postData)
}
/**
 * Create Dana Shop
 */
module.exports.createShop = async ctx => {
  const postData = createShopData(ctx)
  const signature = generateSignature(postData.request)
  postData.signature = signature
  debug('createShop Post Data: ', JSON.stringify(postData))
  return sendRequest(config.createShop, postData)
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
    debug('danaCreateDivisionResponse', JSON.stringify(danaCreateDivisionResponse))
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
    debug('danaCreateShopResponse', JSON.stringify(danaCreateShopResponse))
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
