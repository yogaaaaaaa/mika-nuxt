const helpers = require('../helpers/helper')
require('express-async-errors')

module.exports.tcashInquiry = async (req, res, next) => {
  const transaction = await helpers.getSingleData('transaction', req.body.acc_no)
  if (!transaction) res.status(400).send('XX:Failed Response')
  const compareData = await helpers.compareTransaction(req.body, transaction, 'inquiry')
  await helpers.sendTcashInquiryResponse(res, req, compareData, transaction)
}

module.exports.tcashPay = async (req, res, next) => {
  const transaction = await helpers.getSingleData('transaction', req.body.acc_no)
  if (!transaction) throw Error(helpers.asyncErrorMessage('get'))
  const compareData = await helpers.compareTransaction(req.body, transaction, 'pay')
  await helpers.sendTcashPayResponse(res, req, compareData, transaction)
}
