'use strict'

const msgFactory = require('../helpers/msgFactory')
const intApiAuth = require('../helpers/intApiAuth')

const notif = require('../helpers/notif')

module.exports.auth = async (req, res, next) => {
  let options = {}

  if (req.body.userRole) {
    options.userRole = req.body.userRole
  }

  // Supply bounded terminalId from cipherbox middleware
  if (req.cipherbox) {
    options.terminalId = req.body.cipherbox.terminalId
  }

  let authResult = await intApiAuth.doAuth(req.body.username, req.body.password, options)

  if (authResult) {
    let response = Object.assign({
      sessionToken: authResult.sessionToken
    }, authResult.auth)

    if (response.agentId) {
      response.brokerDetail = await notif.agentJoin(response.agentId)
    }

    msgFactory.expressCreateResponseMessage(
      res,
      msgFactory.messageTypes.MSG_SUCCESS_AUTH,
      response
    )
    return
  }

  msgFactory.expressCreateResponseMessage(
    res,
    msgFactory.messageTypes.MSG_ERROR_INVALID_AUTH
  )
}
