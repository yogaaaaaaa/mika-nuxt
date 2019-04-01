'use strict'

const msgFactory = require('../helpers/msgFactory')

const hash = require('../helpers/hash')
const redis = require('../helpers/redis')

const models = require('../models')

const appConfig = require('')

/**
 * Check for authentication
 * store all auth information inside req.intApiAuth
 * */
module.exports.apiAuth = async function (req, res, next) {
  req.intApiAuth = null
  try {
    if (req.headers['x-access-token']) {
      // Do something
    } else {
      let authComponent = req.headers['authorization'].split(' ')
      if (authComponent[0].toLowerCase() === 'bearer') {
        req.intApiAuth = await authComponent.verifyClientApiToken(authComponent[1])
      }
    }
  } catch (err) {}
  next()
}

/**
 * Handle error there is no authentication
 * */
module.exports.apiAuthErrorHandler = async function (req, res, next) {
  if (req.intApiAuth === null) {
    res.status(401)
      .send(
        msgFactory.generateExtApiResponseMessage(msgFactory.messageTypes.MSG_ERROR_AUTH)
      )
  } else {
    next()
  }
}
