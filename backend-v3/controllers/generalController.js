'use strict'

const msgFactory = require('../helpers/msgFactory')

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
