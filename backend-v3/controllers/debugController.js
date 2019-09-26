'use strict'

const _ = require('lodash')
const { body } = require('express-validator')
const models = require('../models')
const auth = require('../libs/auth')

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
    body('status').isIn(_.values(trxManager.transactionStatuses)),
    body('syncWithAcquirerHost').isBoolean().optional()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    const trxForceUpdateResult = await trxManager.forceStatusUpdate(
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
  }
]

module.exports.changePasswordPolicyFollowMiddlewares = [
  module.exports.changeStatusTransactionValidator = [
    body('userId').exists(),
    body('followPasswordExpiry').isBoolean(),
    body('followFailedLoginLockout').isBoolean()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    const user = await models.user.findByPk(req.body.userId)

    if (!user) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
      )
      return
    }

    user.followPasswordExpiry = req.body.followPasswordExpiry
    user.followFailedLoginLockout = req.body.followFailedLoginLockout

    await auth.removeAuthByUserId(user.id)
    await user.save()

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS
    )
  }
]

module.exports.changePasswordPolicyStateMiddlewares = [
  module.exports.changeStatusTransactionValidator = [
    body('userId').exists(),
    body('lockout').isBoolean(),
    body('expired').isBoolean()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    const user = await models.user.findByPk(req.body.userId)
    if (!user) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
      )
      return
    }

    if (req.body.lockout) {
      user.lockout()
    } else {
      user.unLockout()
    }
    if (req.body.expired) {
      user.expirePassword()
    } else {
      user.unExpirePassword()
    }

    await auth.removeAuthByUserId(user.id)
    await user.save()

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS
    )
  }
]
