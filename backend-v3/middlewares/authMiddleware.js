'use strict'

const msgFactory = require('../helpers/msgFactory')
const auth = require('../helpers/auth')

const appConfig = require('../configs/appConfig')

/**
 * Check for authentication as middleware.
 * This middleware will store all auth information inside `req.auth`.
 *
 * To enforce user type, add user type to array `authUserTypes`.
 * The result of user type check is stored in `req.authInvalidUserType`
 *
 * example:
 ```js
 apiAuthMiddleware.auth([auth.userType.ADMIN, auth.userType.AGENT])
 ```
 *
 */

module.exports.auth = (authUserTypes = null, roles = null) => async (req, res, next) => {
  req.auth = null
  req.sessionToken = null

  if (req.headers[appConfig.sessionTokenHeader]) {
    req.sessionToken = req.headers[appConfig.sessionTokenHeader]
  } else if (req.headers['authorization']) {
    let authComponent = req.headers['authorization'].split(' ')
    if (authComponent[0].toLowerCase() === 'bearer') {
      req.sessionToken = authComponent[1]
    }
  }

  if (req.sessionToken) {
    let checkAuth = await auth.checkAuth(req.sessionToken)
    if (checkAuth) {
      req.auth = checkAuth
      if (Array.isArray(authUserTypes)) {
        if (!authUserTypes.includes(req.auth.userType)) {
          req.authInvalidUserType = true
        }
      }
    }
  }
  next()
}

/**
 * Handle error when no authentication or incorrect user type
 */
module.exports.authErrorHandler = async (req, res, next) => {
  if (req.auth === null) {
    msgFactory.expressCreateResponse(
      res,
      msgFactory.msgTypes.MSG_ERROR_AUTH_INVALID
    )
    return
  } else {
    if (req.authInvalidUserType) {
      msgFactory.expressCreateResponse(
        res,
        msgFactory.msgTypes.MSG_ERROR_AUTH_FORBIDDEN
      )
      return
    }
  }
  next()
}
