'use strict'

const alto = require('../helpers/ppAlto')

module.exports.queryTransaction = async (req, res, next) => {
  let response = {}

  response.payQuery = await alto.altoQueryPayment({ out_trade_no: req.body.id })
  response.refundQuery = await alto.altoQueryRefundPayment({ out_trade_no: req.body.id, out_refund_no: `ref${req.body.id}` })

  res.send(response)
}
