'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')
const trxManager = require('../libs/trxManager')
const msg = require('../libs/msg')

module.exports.generateError = [
  (req, res, next) => {
    throw Error('Test error')
  }
]

module.exports.echoMiddlewares = [
  cipherboxMiddleware.processCipherbox(),
  (req, res, next) => res.send(req.body)
]

module.exports.changeStatusTransactionMiddlewares = [
  module.exports.changeStatusTransactionValidator = [
    body('transactionId').exists(),
    body('status').isIn(_.values(trxManager.transactionStatuses))
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    let transaction = await trxManager.forceStatus(req.body.transactionId, req.body.status)
    if (transaction) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS,
        transaction
      )
    } else {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_BAD_REQUEST
      )
    }
  }
]
