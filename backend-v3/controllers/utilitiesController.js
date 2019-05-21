'use strict'

const trxManager = require('../helpers/trxManager')
const msg = require('../helpers/msg')
const auth = require('../helpers/auth')

module.exports.listTrxManagerProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      types: trxManager.types,
      handlers: trxManager.acquirerHandlers.map((acquirerHandler) => trxManager.formatAcquirerInfo(acquirerHandler))
    }
  )
}

module.exports.listMsgProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      msgTypes: msg.msgTypes,
      eventTypes: msg.eventTypes
    }
  )
}

module.exports.listAuthProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      userRoleTypes: auth.userRoles,
      userTypes: auth.userTypes
    }
  )
}
