'use strict'

const errorMiddleware = require('../middlewares/errorMiddleware')
const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')

const msg = require('../libs/msg')
const auth = require('../libs/auth')

const { body } = require('express-validator/check')

module.exports.loginValidator = [
  body('username').exists(),
  body('password').exists(),
  body('userTypes').isArray().optional()
]

module.exports.resetPasswordValidator = [
  body('userId').exists(),
  body('password').isString()
]

module.exports.sessionTokenCheckValidator = [
  body('sessionToken').isString()
]

module.exports.changePasswordValidator = [
  body('oldPassword').isString().isLength({ min: 8, max: 250 }),
  body('password').isString().isLength({ min: 8, max: 250 })
]

module.exports.login = async (req, res, next) => {
  let options = {}

  options.userTypes = req.body.userTypes

  // Supply terminalId from cipherbox middleware
  if (req.cipherbox) {
    options.terminalId = req.body.cipherbox.terminalId
  }

  let authResult = await auth.doAuth(req.body.username, req.body.password, options)

  if (authResult) {
    let response = Object.assign({
      sessionToken: authResult.sessionToken,
      authExpirySecond: authResult.authExpirySecond
    }, authResult.auth)

    if (authResult.brokerDetail) {
      response.brokerDetail = authResult.brokerDetail
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_LOGIN,
      response
    )
    return
  }

  msg.expressResponse(
    res,
    msg.msgTypes.MSG_ERROR_AUTH_INVALID_CREDENTIAL
  )
}

module.exports.logout = async (req, res, next) => {
  if (await auth.removeAuth(req.sessionToken)) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_LOGOUT
    )
  }
}

module.exports.sessionTokenCheck = async (req, res, next) => {
  let checkAuth = await auth.checkAuth(req.body.sessionToken)
  if (checkAuth) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_TOKEN_CHECK,
      checkAuth
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_AUTH_INVALID_TOKEN
    )
  }
}

module.exports.changePassword = async (req, res, next) => {
  if (await auth.changePassword(req.auth.userId, req.body.password, req.body.oldPassword)) {
    await auth.removeAuth(req.sessionToken)
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
    )
    return
  }

  msg.expressResponse(
    res,
    msg.msgTypes.MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD
  )
}

module.exports.resetPassword = async (req, res, next) => {
  if (auth.resetAuth(req.body.userId, req.body.password)) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
    )
  }
}

module.exports.loginMiddlewares = [
  cipherboxMiddleware.processCipherbox(),
  exports.loginValidator,
  errorMiddleware.validatorErrorHandler,
  exports.login
]

module.exports.changePasswordMiddlewares = [
  exports.changePasswordValidator,
  errorMiddleware.validatorErrorHandler,
  exports.changePassword
]

module.exports.sessionTokenCheckMiddlewares = [
  exports.sessionTokenCheckValidator,
  errorMiddleware.validatorErrorHandler,
  exports.sessionTokenCheck
]

module.exports.resetPasswordMiddlewares = [
  exports.resetPasswordValidator,
  errorMiddleware.validatorErrorHandler,
  exports.resetPassword
]
