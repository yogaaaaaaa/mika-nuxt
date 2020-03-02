'use strict'

const _ = require('lodash')
const debugGlobal = require('debug')
const { body } = require('express-validator')
const models = require('models')
const auth = require('libs/auth')

const mqtt = require('libs/mqtt')
const debugMiddleware = require('middlewares/debugMiddleware')
const cipherboxMiddleware = require('middlewares/cipherboxMiddleware')
const errorMiddleware = require('middlewares/errorMiddleware')
const trxManager = require('libs/trxManager')
const msg = require('libs/msg')

module.exports.generateErrorMiddlewares = [
  (req, res, next) => {
    console.log('Debug Test error is called')
    throw Error('Test error')
  }
]

module.exports.echoMiddlewares = [
  cipherboxMiddleware.processCipherbox(),
  (req, res, next) => {
    console.log('Debug Echo Called')
    console.log('Method:', req.method)
    console.log('Queries:', JSON.stringify(req.query, null, 2))
    console.log('Headers:', JSON.stringify(req.headers, null, 2))
    console.log('Body:', JSON.stringify(req.body, null, 2))
    console.log()
    res.send(req.body)
  }
]

module.exports.crashMiddlewares = [
  [
    body('returnCode').isInt()
  ],
  errorMiddleware.validatorErrorHandler,
  (req, res, next) => {
    const returnCode = req.body.errorCode || 1
    console.log('Debug Crash is called with return code', returnCode)

    process.exit(returnCode)
  }
]

module.exports.setHttpDelayMiddlewares = [
  [
    body('pathDelays.*.path').isString().optional(),
    body('pathDelays.*.before').isNumeric().optional(),
    body('pathDelays.*.after').isNumeric().optional()
  ],
  errorMiddleware.validatorErrorHandler,
  (req, res, next) => {
    debugMiddleware.pathDelays = req.body.pathDelays || []

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS
    )
  }
]

module.exports.setMqttDelayMiddlewares = [
  [
    body('pathDelays.*.path').isString().optional(),
    body('pathDelays.*.before').isNumeric().optional()
  ],
  errorMiddleware.validatorErrorHandler,
  (req, res, next) => {
    mqtt.pathDelays = req.body.pathDelays || []
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS
    )
  }
]

module.exports.databaseQueryMiddlewares = [
  async (req, res, next) => {
    try {
      const result = await models.sequelize.query(req.body)

      const data = result[0]
      const meta = {
        length: data.length
      }

      msg.expressResponse(res, msg.msgTypes.MSG_SUCCESS, data, meta)
    } catch (err) {
      if (err.name === 'SequelizeDatabaseError') {
        msg.expressResponse(res, msg.msgTypes.MSG_ERROR_BAD_REQUEST, err.message)
      } else {
        throw err
      }
    }
  }
]

module.exports.changeStatusTransactionMiddlewares = [
  [
    body('transactionId').isString(),
    body('status').isIn(_.values(trxManager.transactionStatuses)),
    body('syncWithAcquirerHost').isBoolean().optional()
  ],
  errorMiddleware.validatorErrorHandler,
  async (req, res, next) => {
    const trxForceUpdateResult = await trxManager.forceStatusUpdate({
      transactionId: req.body.transactionId,
      newTransactionStatus: req.body.status,
      syncWithAcquirerHost: req.body.syncWithAcquirerHost
    })

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS,
      trxForceUpdateResult
    )
  }
]

module.exports.changePasswordPolicyFollowMiddlewares = [
  [
    body('userId').isInt(),
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
  [
    body('userId').isInt(),
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

module.exports.setDebugNamespacesMiddlewares = [
  [
    body('namespaces').isString()
  ],
  errorMiddleware.validatorErrorHandler,
  (req, res, next) => {
    debugGlobal.disable()
    debugGlobal.enable(req.body.namespaces)
    console.log('Set debug namespaces to', req.body.namespaces)
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS
    )
  }
]
