'use strict'

const { body } = require('express-validator')

const models = require('../models')
const alto = require('../libs/aqAlto')

const errorMiddleware = require('../middlewares/errorMiddleware')

const msg = require('../libs/msg')

module.exports.queryTransactionMiddlewares = [
  module.exports.changeStatusTransactionValidator = [
    body('acquirerConfigId').exists().optional({ nullable: true }),
    body('out_refund_no').exists().optional({ nullable: true }),
    body('out_trade_no').exists()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    const acquirerConfig = await models.acquirerConfig.findOne({
      where: {
        id: req.body.acquirerConfigId
      }
    }) || { config: {} }
    const altoConfig = alto.mixConfig(acquirerConfig.config)

    const response = {}
    response.payQuery = await alto.altoQueryPayment(
      Object.assign(
        {
          out_trade_no: req.body.out_trade_no
        },
        altoConfig
      )
    )
    if (req.body.out_refund_no) {
      response.refundQuery = await alto.altoQueryRefundPayment(
        Object.assign(
          {
            out_trade_no: req.body.out_trade_no,
            out_refund_no: req.body.out_refund_no
          },
          altoConfig
        )
      )
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS,
      response
    )
  }
]
