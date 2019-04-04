'use strict'

const msgFactory = require('../helpers/msgFactory')

/**
 * Return 'not implemented' status code
 *
 * Its ok ...
 */
module.exports.notImplemented = (req, res, next) => {
  msgFactory.expressCreateResponseMessage(
    res,
    msgFactory.messageTypes.MSG_ERROR_NOT_IMPLEMENTED
  )
}
