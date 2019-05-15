'use strict'

const trxManager = require('../helpers/trxManager')
const msg = require('../helpers/msg')
const auth = require('../helpers/auth')

/**
 * List all enumeration types in mika system
 */
module.exports.listTypes = async (req, res, next) => {
  msg.expressCreateResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      trxManager: trxManager.types,
      msg: msg.types,
      authTypes: {
        userRoles: auth.userRoles,
        userTypes: auth.userTypes
      }
    }
  )
}
