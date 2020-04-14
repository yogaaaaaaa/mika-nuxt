'use strict'

const moment = require('moment')
const { decimalAmountPadded } = require('../format')
const config = require('configs/aqDanaConfig')

/**
 * DANA CREATE TRANSACTION DATA
 */
module.exports.createTransactionData = ctx => {
  const now = moment()
  return {
    request: {
      head: {
        function: 'dana.mobile.create.qris',
        version: '1.0',
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        reqTime: now.format(),
        reqMsgId: ctx.transaction.id,
        accessToken: ctx.transaction.id,
        reserve: ''
      },
      body: {
        envInfo: {
          terminalType: 'SYSTEM',
          orderTerminalType: 'APP'
        },
        order: {
          merchantTransId: ctx.transaction.id,
          orderAmount: {
            value: decimalAmountPadded(ctx.transaction.amount),
            currency: 'IDR'
          }
        },
        merchantId: config.merchantId,
        subMerchantId: ctx.acquirerConfigMerged.externalDivisionId || undefined,
        shopInfo: {
          externalShopId: ctx.acquirerConfigMerged.externalShopId || undefined
        }
      }
    }
  }
}

/**
 * DANA CANCEL TRANSACTION DATA
 */
module.exports.cancelTransactionData = ctx => {
  const now = moment()
  return {
    request: {
      head: {
        version: '2.0',
        function: 'dana.acquiring.order.cancel',
        clientSecret: config.clientSecret,
        clientId: config.clientId,
        reqTime: now.format(),
        reqMsgId: ctx.transaction.id,
        reserve: ''
      },
      body: {
        merchantId: config.merchantId,
        acquirementId: ctx.transaction.referenceNumber || undefined,
        cancelReason: 'time out',
        merchantTransId: ctx.transaction.id,
        cancelTime: now.format()
      }
    }
  }
}

/**
 * DANA QUERY TRANSACTION DATA
 */
module.exports.queryTransactionData = ctx => {
  const now = moment()
  const { id } = ctx.transaction
  return {
    request: {
      head: {
        version: '2.0',
        function: 'dana.acquiring.order.query',
        clientId: config.clientId,
        reqTime: now.format(),
        reqMsgId: id,
        clientSecret: config.clientSecret,
        reserve: ''
      },
      body: {
        merchantId: config.merchantId,
        merchantTransId: id
      }
    }
  }
}

/**
 * DANA REFUND TRANSACTION DATA
 */
module.exports.refundTransactionData = ctx => {
  const now = moment()
  const { id, reference } = ctx.transaction
  return {
    request: {
      head: {
        version: '2.0',
        function: 'dana.acquiring.refund.syncRefund',
        clientId: config.clientId,
        reqTime: now.format(),
        reqMsgId: id,
        clientSecret: config.clientSecret,
        reserve: ''
      },
      body: {
        requestId: id,
        merchantId: config.merchantId,
        acquirementId: reference,
        refundAmount: {
          value: decimalAmountPadded(ctx.transaction.amount),
          currency: 'IDR'
        },
        refundAppliedTime: now.format(),
        actorType: 'BACK_OFFICE',
        refundReason: ctx.transactionRefund.reason || 'Refund by system',
        returnChargeToPayer: true,
        destination: 'TO_BALANCE',
        extendInfo: '',
        envInfo: {}
      }
    }
  }
}

/**
 * DANA CREATE DIVISION
 */
module.exports.createDivisionData = ctx => {
  const now = moment()
  const { merchant, externalDivisionId } = ctx
  const logo = merchant.icon ? merchant.icon.split(',')[1] : ''
  return {
    request: {
      head: {
        version: '2.0',
        function: 'dana.merchant.division.createDivision',
        clientId: config.clientId,
        reqTime: now.format(),
        reqMsgId: now.unix().toString(),
        clientSecret: config.clientSecret,
        reserve: ''
      },
      body: {
        merchantId: config.merchantId,
        parentRoleType: 'MERCHANT',
        divisionName: merchant.name,
        divisionAddress: {
          country: merchant.country || 'Indonesia',
          province: merchant.province,
          city: merchant.city,
          area: merchant.locality,
          address1: merchant.streetAddress
          // address2: merchant.address2,
          // postcode: merchant.postcode
        },
        divisionDescription: merchant.description,
        divisionType: 'REGION',
        externalDivisionId: externalDivisionId,
        extInfo: {},
        logoUrlMap: {
          LOGO: logo,
          PC_LOGO: logo,
          MOBILE_LOGO: logo
        }
      }
    }
  }
}

/**
 * DANA CREATE SHOP
 */
module.exports.createShopData = ctx => {
  const now = moment()
  const { merchant, externalDivisionId, externalShopId } = ctx
  const logo = merchant.icon ? merchant.icon.split(',')[1] : ''

  return {
    request: {
      head: {
        version: '2.0',
        function: 'dana.merchant.shop.createShop',
        clientId: config.clientId,
        reqTime: now.format(),
        reqMsgId: now.unix().toString(),
        clientSecret: config.clientSecret,
        reserve: ''
      },
      body: {
        merchantId: config.merchantId,
        shopParentType: 'EXTERNAL_DIVISION',
        parentDivisionId: externalDivisionId,
        mainName: merchant.name + ' Outlet',
        divisionAddress: {
          country: merchant.country || 'Indonesia',
          province: merchant.province,
          city: merchant.city,
          area: merchant.locality,
          address1: merchant.streetAddress
          // address2: merchant.address2,
          // postcode: merchant.postcode
        },
        shopDesc: merchant.description,
        divisionType: 'REGION',
        externalShopId: externalShopId,
        extInfo: {},
        taxNo: merchant.taxCardNumber,
        sizeType: 'UMI',
        logoUrlMap: {
          LOGO: logo,
          PC_LOGO: logo,
          MOBILE_LOGO: logo
        }
      }
    }
  }
}
