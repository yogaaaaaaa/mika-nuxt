'use strict'

const msgFactory = require('../helpers/msgFactory')

module.exports.notImplemented = (req, res, next) => {
  msgFactory.expressCreateResponseMessage(
    res,
    msgFactory.messageTypes.MSG_ERROR_NOT_IMPLEMENTED
  )
}
