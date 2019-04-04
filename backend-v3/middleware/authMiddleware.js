'use strict'

const msgFactory = require('../helpers/msgFactory')
const auth = require('../helpers/auth')

const appConfig = require('../config/appConfig')

/**
 * Check for authentication as middleware.
 * THis middleware will store all auth information inside `req.auth`.
 *
 * To enforce user type, add user type to array `authUserTypes`.
 *
 * example:
 ```js
 authUserType = [auth.userType.ADMIN, auth.userType.AGENT]
 ```
 */

module.exports.auth = (authUserTypes = null, roles = null) => async (req, res, next) => {
  req.auth = null
  try {
    let sessionToken = null

    if (req.headers[appConfig.sessionTokenHeader]) {
      sessionToken = req.headers[appConfig.sessionTokenHeader]
    } else if (req.headers['authorization']) {
      let authComponent = req.headers['authorization'].split(' ')
      if (authComponent[0].toLowerCase() === 'bearer') {
        sessionToken = authComponent[1]
      }
    }

    let checkAuth = await auth.checkAuth(sessionToken)
    if (checkAuth) {
      req.auth = checkAuth
      if (Array.isArray(authUserTypes)) {
        if (!authUserTypes.includes(req.auth.userType)) {
          req.authInvalidUserType = true
        }
      }
    }
  } catch (error) {
    console.log(error)
  }

  next()
}

/**
 * Handle error where there is no authentication or invalid user type
 */
module.exports.authErrorHandler = async (req, res, next) => {
  if (req.auth === null) {
    msgFactory.expressCreateResponseMessage(
      res,
      msgFactory.messageTypes.MSG_ERROR_NOT_AUTHENTICATED
    )
    return
  } else {
    if (req.authInvalidUserType) {
      msgFactory.expressCreateResponseMessage(
        res,
        msgFactory.messageTypes.MSG_ERROR_FORBIDDEN
      )
      return
    }
  }
  next()
}
