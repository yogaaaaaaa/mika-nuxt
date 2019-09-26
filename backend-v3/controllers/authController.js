'use strict'

const msg = require('../libs/msg')
const auth = require('../libs/auth')

const errorMiddleware = require('../middlewares/errorMiddleware')
const cipherboxMiddleware = require('../middlewares/cipherboxMiddleware')
const authValidator = require('../validators/authValidator')

const commonConfig = require('../configs/commonConfig')

module.exports.login = async (req, res, next) => {
  const options = {}

  options.userTypes = req.body.userTypes

  // Supply terminalId from cipherbox middleware
  if (req.cipherbox) {
    options.terminalId = req.body.cipherbox.terminalId
  }

  const authResult = await auth.doAuth(req.body.username, req.body.password, options)

  if (authResult) {
    const response = Object.assign({
      sessionToken: authResult.sessionToken,
      authExpirySecond: authResult.authExpirySecond,
      publicDetails: {
        thumbnailsBaseUrl: `${commonConfig.baseUrl}${commonConfig.thumbnailsEndpoint}`
      }
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
  const checkAuth = await auth.checkAuth(req.body.sessionToken)
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
  await auth.changePassword(
    req.auth.userId,
    req.body.password,
    req.body.oldPassword
  )
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
  )
}

module.exports.changeExpiredPassword = async (req, res, next) => {
  if (!await auth.changeExpiredPassword(
    req.body.username,
    req.body.password,
    req.body.oldPassword
  )) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD
    )
    return
  }

  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
  )
}

module.exports.loginMiddlewares = [
  cipherboxMiddleware.processCipherbox(),
  authValidator.loginValidator,
  errorMiddleware.validatorErrorHandler,
  exports.login
]

module.exports.changePasswordMiddlewares = [
  authValidator.changePasswordValidator,
  errorMiddleware.validatorErrorHandler,
  exports.changePassword
]

module.exports.changeExpiredPasswordMiddlewares = [
  authValidator.changeExpiredPasswordValidator,
  errorMiddleware.validatorErrorHandler,
  exports.changeExpiredPassword
]

module.exports.sessionTokenCheckMiddlewares = [
  authValidator.sessionTokenCheckValidator,
  errorMiddleware.validatorErrorHandler,
  exports.sessionTokenCheck
]
