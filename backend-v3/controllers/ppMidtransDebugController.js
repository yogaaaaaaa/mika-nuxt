'use strict'

const models = require('../models')
const midtrans = require('../helpers/ppMidtrans')

module.exports.queryTransaction = async (req, res, next) => {
  let response = {}

  let paymentProviderConfig = await models.paymentProviderConfig.scope('paymentProviderConfigKv').findOne({
    where: {
      id: req.body.paymentProviderConfigId
    }
  }) || { config: {} }

  let midtransConfig = midtrans.mixConfig(paymentProviderConfig.config)

  response.transactionStatus = await midtrans.statusTransaction(Object.assign({
    order_id: req.body.order_id
  }, midtransConfig))

  res.send(response)
}
