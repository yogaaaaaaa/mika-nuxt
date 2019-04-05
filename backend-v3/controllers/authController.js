'use strict'

const msgFactory = require('../helpers/msgFactory')
const auth = require('../helpers/auth')

const notif = require('../helpers/notif')

/**
 * Login user
 */
module.exports.login = async (req, res, next) => {
  let options = {}

  if (req.body.userTypes) {
    options.userTypes = req.body.userTypes
  }

  // Supply bounded terminalId from cipherbox middleware
  if (req.cipherbox) {
    options.terminalId = req.body.cipherbox.terminalId
  }

  let authResult = await auth.doAuth(req.body.username, req.body.password, options)

  if (authResult) {
    let response = Object.assign({
      sessionToken: authResult.sessionToken
    }, authResult.auth)

    if (response.agentId) {
      response.brokerDetail = await notif.agentJoin(response.agentId)
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
  if (auth.removeAuth(req.auth.userId)) {
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

/**
 * Check current session token
 */
module.exports.sessionTokenCheck = async (req, res, next) => {
  let authResult = await auth.checkAuth(req.body.sessionToken)
  if (authResult) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_TOKEN_CHECK,
      authResult
    )
  } else {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_ERROR_AUTH_INVALID_TOKEN
    )
  }
}

/**
 * Change password based on current `req.auth`
 */
module.exports.changePassword = async (req, res, next) => {
  if (await auth.resetAuth(req.auth.userId, req.body.password, req.body.oldPassword)) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
    )
  }
}

/**
 * Reset password (all user)
 */
module.exports.resetPassword = async (req, res, next) => {
  if (auth.resetAuth(req.body.userId, req.body.password)) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_SUCCESS_AUTH_CHANGE_PASSWORD
    )
  }
}