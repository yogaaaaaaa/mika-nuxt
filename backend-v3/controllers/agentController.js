'use strict'

const models = require('../models')
const msgFactory = require('../helpers/msgFactory')

/**
 * Get current agent's (via `req.auth.userType`)
 */
module.exports.getAgent = async (req, res, next) => {
  let agent = await models.agent
    .scope('agent')
    .findByPk(req.auth.agentId)

  msgFactory.expressCreateResponse(
    res,
    agent
      ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND
      : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
    agent
  )
}
