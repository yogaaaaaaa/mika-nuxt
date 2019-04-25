'use strict'

const msgFactory = require('../helpers/msgFactory')
const appConfig = require('../configs/appConfig')

/**
 * Return 'not implemented' status code
 *
 * Its ok ...
 */
module.exports.notImplemented = (req, res, next) => {
  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_ERROR_NOT_IMPLEMENTED
  )
}

module.exports.moved = (url, baseUrl = appConfig.baseUrl) => (req, res, next) => {
  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS_MOVED,
    `${baseUrl}${url}`
  )
}

/**
 * Welcome controller
 */
module.exports.welcome = (req, res, next) => {
  msgFactory.expressCreateResponse(
    res,
    msgFactory.msgTypes.MSG_SUCCESS,
    'Welcome to backend-v3'
  )
}
