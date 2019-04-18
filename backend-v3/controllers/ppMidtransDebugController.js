'use strict'

const models = require('../models')
const midtrans = require('../helpers/ppMidtrans')

module.exports.queryTransaction = async (req, res, next) => {
  let response = {}

  let paymentProviderConfig = models.paymentProviderConfig.findOne({
    where: {
      id: req.body.paymentProviderConfigId
    },
    attributes: ['config']
  }) || { config: {} }

  response.transactionStatus = await midtrans.statusTransaction(Object.assign({
    order_id: req.body.order_id
  }, paymentProviderConfig.config))

  res.send(response)
}
