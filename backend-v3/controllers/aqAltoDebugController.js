'use strict'

const models = require('../models')
const alto = require('../libs/aqAlto')

module.exports.queryTransaction = async (req, res, next) => {
  let response = {}

  let acquirerConfig = await models.acquirerConfig.scope('acquirerConfigKv').findOne({
    where: {
      id: req.body.acquirerConfigId
    }
  }) || { config: {} }

  let altoConfig = alto.mixConfig(acquirerConfig.config)

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
