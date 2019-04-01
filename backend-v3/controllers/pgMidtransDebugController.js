'use strict'

const midtrans = require('../helpers/pgMidtrans')

module.exports.queryTransaction = async (req, res, next) => {
  res.send(await midtrans.statusTransaction({ order_id: req.body.order_id }))
}
