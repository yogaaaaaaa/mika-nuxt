'use strict'

const { body } = require('express-validator')

const models = require('../models')
const midtrans = require('../libs/aqMidtrans')

const errorMiddleware = require('../middlewares/errorMiddleware')

const msg = require('../libs/msg')

module.exports.queryTransactionMiddlewares = [
  module.exports.changeStatusTransactionValidator = [
    body('acquirerConfigId').exists().optional({ nullable: true }),
    body('order_id').exists()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    let acquirerConfig = await models.acquirerConfig.scope('acquirerConfigKv').findOne({
      where: {
        id: req.body.acquirerConfigId
      }
    }) || { config: {} }
    let midtransConfig = midtrans.mixConfig(acquirerConfig.config)

    let response = {}
    response.transactionStatus = await midtrans.statusTransaction(
      Object.assign(
        { order_id: req.body.order_id },
        midtransConfig
      )
    )
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS,
      response
    )
  }
]
