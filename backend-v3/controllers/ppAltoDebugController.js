'use strict'

const models = require('../models')
const alto = require('../helpers/ppAlto')

module.exports.queryTransaction = async (req, res, next) => {
  let response = {}

  let paymentProviderConfig = await models.paymentProviderConfig.scope('paymentProviderConfigKv').findOne({
    where: {
      id: req.body.paymentProviderConfigId
    }
  }) || { config: {} }

  let altoConfig = alto.mixConfig(paymentProviderConfig.config)

  response.payQuery = await alto.altoQueryPayment(Object.assign({
    out_trade_no: req.body.out_trade_no
  }, altoConfig))

  if (req.body.out_refund_no) {
    response.refundQuery = await alto.altoQueryRefundPayment(Object.assign({
      out_trade_no: req.body.id,
      out_refund_no: req.body.out_refund_no
    }, altoConfig))
  }

  res.send(response)
}
