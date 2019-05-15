'use strict'

const models = require('../models')
const midtrans = require('../helpers/aqMidtrans')

module.exports.queryTransaction = async (req, res, next) => {
  let response = {}

  let acquirerConfig = await models.acquirerConfig.scope('acquirerConfigKv').findOne({
    where: {
      id: req.body.acquirerConfigId
    }
  }) || { config: {} }

  let midtransConfig = midtrans.mixConfig(acquirerConfig.config)

  response.transactionStatus = await midtrans.statusTransaction(Object.assign({
    order_id: req.body.order_id
  }, midtransConfig))

  res.send(response)
}
