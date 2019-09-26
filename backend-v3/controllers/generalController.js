'use strict'

const msg = require('../libs/msg')
const commonConfig = require('../configs/commonConfig')

/**
 * Global Welcome controller
 */
module.exports.welcome = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    'Welcome to backend-v3'
  )
}

module.exports.notImplemented = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_ERROR_NOT_IMPLEMENTED
  )
}

/**
 * Controller to display moved endpoint
 */
module.exports.moved = (url, baseUrl = commonConfig.baseUrl) => (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS_MOVED,
    `${baseUrl}${url}`
  )
}
