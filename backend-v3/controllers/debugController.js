'use strict'

const _ = require('lodash')
const { body } = require('express-validator')

const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const trxManagerError = require('./helpers/trxManagerError')
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
    body('status').isIn(_.values(trxManager.transactionStatuses)),
    body('syncWithAcquirerHost').isBoolean().optional()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    try {
      let trxForceUpdateResult = await trxManager.forceStatusUpdate(
        req.body.transactionId,
        req.body.status,
        {
          syncWithAcquirerHost: req.body.syncWithAcquirerHost
        }
      )

      msg.expressResponse(
        res,
        msg.msgTypes.MSG_SUCCESS,
        trxForceUpdateResult
      )
    } catch (err) {
      trxManagerError.handleError(err, res)
    }
  }
]
