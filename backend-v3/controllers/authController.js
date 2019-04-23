'use strict'

const msgFactory = require('../helpers/msgFactory')
const auth = require('../helpers/auth')

const { body } = require('express-validator/check')

/**
 * Validator for login controller
 */
module.exports.loginValidator = [
  body('username').exists(),
  body('password').exists(),
  body('userTypes').isArray().optional()
]

/**
 * Login user
 */
module.exports.login = async (req, res, next) => {
  let options = {}

  options.userTypes = req.body.userTypes

  // Supply bounded terminalId from cipherbox middleware
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

    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_LOGIN,
      response
    )
    return
  }

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_ERROR_AUTH_INVALID_CREDENTIAL
  )
}

/**
 * Logout user
 */
module.exports.logout = async (req, res, next) => {
  if (await auth.removeAuth(req.sessionToken)) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_LOGOUT
    )
  }
}

/**
 * Logout ALL user
 */
module.exports.logoutAll = async (req, res, next) => {

}

module.exports.sessionTokenCheckValidator = [
  body('sessionToken').isString()
]

/**
 * Check current session token
 */
module.exports.sessionTokenCheck = async (req, res, next) => {
  let checkAuth = await auth.checkAuth(req.body.sessionToken)
  if (checkAuth) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_TOKEN_CHECK,
      checkAuth
    )
  } else {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_ERROR_AUTH_INVALID_TOKEN
    )
  }
}

/**
 * Validator for changePassword controller
 */
module.exports.changePasswordValidator = [
  body('oldPassword').isString(),
  body('password').isString()
]

/**
 * Change password based on current `req.auth`
 */
module.exports.changePassword = async (req, res, next) => {
  if (await auth.resetAuth(req.auth.userId, req.body.password, req.body.oldPassword)) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
    )
    return
  }

  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD
  )
}

/**
 * Validator for resetPassword controller
 */
module.exports.resetPasswordValidator = [
  body('userId').exists(),
  body('password').isString()
]

/**
 * Reset password (all user) admin only
 */
module.exports.resetPassword = async (req, res, next) => {
  if (auth.resetAuth(req.body.userId, req.body.password)) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
    )
  }
}
