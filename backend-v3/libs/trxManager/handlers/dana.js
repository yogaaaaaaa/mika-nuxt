'use strict'

/**
 * DANA Acquirer handler
 */

const { createError } = require('libs/error')
const {
  handlerName,
  createTransaction,
  cancelTransaction,
  queryTransaction,
  refundTransaction
} = require('libs/aqDana')
const debug = require('debug')('mika:dana:handler')
const config = require('configs/aqDanaConfig')
const {
  errorTypes,
  transactionFlows,
  paymentClasses,
  tokenTypes,
  transactionStatuses
} = require('../constants')

function checkResponse (response) {
  if (!response) {
    debug('No response from Dana')
    throw createError({
      name: errorTypes.ACQUIRER_HOST_NO_RESPONSE,
      data: response
    })
  }
  if (!response.response) {
    debug('No response from Dana')
    throw createError({
      name: errorTypes.ACQUIRER_HOST_NO_RESPONSE,
      data: response
    })
  }
  const { resultInfo } = response.response.body
  if (!resultInfo) {
    debug('No resultInfo from Dana')
    throw createError({
      name: errorTypes.ACQUIRER_HOST_RESPONSE_ERROR,
      data: response
    })
  }
  const { resultCode } = resultInfo
  if (config.danaErrors.includes(resultCode)) {
    debug(`${resultCode} from Dana`)
    throw createError({
      name: errorTypes.ACQUIRER_HOST_RESPONSE_ERROR,
      data: { resultCode }
    })
  }
}

module.exports = {
  name: handlerName,
  classes: [paymentClasses.DANA],
  defaultMinimumAmount: 1,
  defaultMaximumAmount: null,
  singleTransactionOnly: false,
  useTraceNumber: false,
  properties: {
    flows: [
      transactionFlows.PROVIDE_TOKEN,
      transactionFlows.REFUND,
      transactionFlows.PARTIAL_REFUND
    ],
    tokenTypes: [tokenTypes.TOKEN_QRCODE_CONTENT],
    userTokenTypes: []
  },
  checkResponse,

  /**
   * Create Dana Transaction
   */
  async handler (ctx) {
    debug('Handler')
    const response = await createTransaction(ctx)
    checkResponse(response)
    const danaResponse = response.response
    ctx.transaction.token = danaResponse.body.qrisCode
    ctx.transaction.tokenType = tokenTypes.TOKEN_QRCODE_CONTENT
  },

  /**
   * Cancel Dana Transaction
   */
  async cancelHandler (ctx) {
    const response = await cancelTransaction(ctx)
    checkResponse(response)
  },

  /**
   * To make Dana transaction expires
   */
  async expiryHandler (ctx) {
    debug('Expiry Handler')
    const { transaction } = ctx
    // Dana Order Query
    const response = await queryTransaction(ctx)

    // Check Dana Query Status if Success
    // if not, cancel transaction on Dana Side
    if (response) {
      const danaResponse = response.response
      const resultCode = danaResponse.body.resultInfo.resultCode
      if (resultCode && resultCode === 'SUCCESS') {
        const acquirementStatus =
          danaResponse.body.statusDetail.acquirementStatus
        if (acquirementStatus && acquirementStatus === 'SUCCESS') {
          transaction.status = transactionStatuses.SUCCESS
          transaction.reference = danaResponse.body.acquirementId
          transaction.referenceName = 'acquirementId'
        }
        if (acquirementStatus === 'INIT') {
          await this.cancelHandler({ transaction })
        }
      }
    }
    debug('transaction status :', transaction.status)
  },

  /**
   * Same thing with Dana Cancel Transaction
   */
  async reverseHandler (ctx) {
    debug('Reverse Handler')
    await this.cancelHandler(ctx)
  },

  /**
   * To refund Dana Success Transaction
   */
  async refundHandler (ctx) {
    debug('Refund Handler')
    const { transaction } = ctx
    const response = await refundTransaction(ctx)
    checkResponse(response, ctx)
    transaction.status = transactionStatuses.REFUNDED
  }
}
