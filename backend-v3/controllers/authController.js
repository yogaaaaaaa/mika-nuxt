'use strict'

const msg = require('libs/msg')
const auth = require('libs/auth')
const notif = require('libs/notif')

const crudGenerator = require('./helpers/crudGenerator')
const errorMiddleware = require('middlewares/errorMiddleware')
const cipherboxMiddleware = require('middlewares/cipherboxMiddleware')
const authValidator = require('validators/authValidator')

const commonConfig = require('configs/commonConfig')

const brokerHost = notif.brokerHost
const publicDetails = {
  thumbnailsBaseUrl: `${commonConfig.baseUrl}${commonConfig.thumbnailsEndpoint}`
}

module.exports.login = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'AUTH/LOGIN'
  }

  req.auth = undefined

  const options = {}
  options.userTypes = req.body.userTypes
  // Supply terminalId from cipherbox middleware
  if (req.cipherbox) options.terminalId = req.body.cipherbox.terminalId

  const authResult = await auth.doAuth(req.body.username, req.body.password, options)

  if (authResult) {
    req.auth = authResult.auth
    const response = {
      ...authResult.auth,
      sessionToken: authResult.sessionToken,
      authExpirySecond: authResult.authExpirySecond,
      userDek: authResult.userDek,
      sessionUserDek: authResult.sessionUserDek,
      brokerDetail: authResult.brokerDetail,
      publicDetails
    }

    if (response.brokerDetail) {
      response.brokerDetail = {
        ...brokerHost,
        ...response.brokerDetail
      }
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_LOGIN,
      response
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_AUTH_INVALID_CREDENTIAL
    )
  }
}

module.exports.logout = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'AUTH/LOGOUT'
  }

  if (await auth.removeAuth(req.sessionToken)) {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_LOGOUT
    )
  }
}

module.exports.sessionTokenCheck = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'AUTH/SESSION_CHECK'
  }

  const sessionData = await auth.checkAuth(req.body.sessionToken)

  if (sessionData) {
    const response = {
      ...sessionData.auth,
      brokerDetail: sessionData.brokerDetail,
      publicDetails
    }

    if (response.brokerDetail) {
      response.brokerDetail = {
        ...brokerHost,
        ...response.brokerDetail
      }
    }

    msg.expressResponse(
      res,
      msg.msgTypes.MSG_SUCCESS_AUTH_TOKEN_CHECK,
      response
    )
  } else {
    msg.expressResponse(
      res,
      msg.msgTypes.MSG_ERROR_AUTH_INVALID_TOKEN
    )
  }
}

module.exports.changePassword = async (req, res, next) => {
  if (req.audit) {
    req.audit.event.type = 'AUTH/CHANGE_PASSWORD'
  }

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
  if (req.audit) {
    req.audit.event.type = 'AUTH/CHANGE_EXPIRED_PASSWORD'
  }
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

module.exports.selfPasswordCheckMiddlewares = [
  authValidator.passwordCheckValidator,
  errorMiddleware.validatorErrorHandler,
  crudGenerator.generateActionEntityController({
    modelName: 'user',
    identifierSource: {
      path: 'auth.userId',
      as: 'id'
    },
    actionHandler: async ({ crudCtx, req }) => {
      if (await crudCtx.modelInstance.checkPassword(req.body.password)) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_SUCCESS
        crudCtx.response = undefined
      } else {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_AUTH_SELF_PASSWORD_CHECK
        crudCtx.response = undefined
      }
    }
  })
]
