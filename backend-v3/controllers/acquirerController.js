'use strict'

const trxManager = require('../helpers/trxManager')
const msg = require('../helpers/msg')
const models = require('../models')

/**
 * Get one or many agent's acquirers (via `req.auth.userType`)
 */
module.exports.getAgentAcquirers = async (req, res, next) => {
  let query = {
    where: {
      id: req.auth.agentId
    }
  }

  if (req.params.acquirerId) {
    let acquirer = null

    let agent = await models.agent.scope(
      { method: ['agentAcquirer', req.params.acquirerId] }
    ).findOne(query)

    if (agent) {
      if (agent.merchant.acquirers.length) {
        acquirer = agent.merchant.acquirers[0]
        acquirer._handler = trxManager.getAcquirerInfo(acquirer.acquirerConfig.handler)
      }
    }
    msg.expressCreateResponse(
      res,
      acquirer ? msg.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msg.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      acquirer
    )
  } else {
    let acquirers = null

    let agent = await models.agent.scope(
      'agentAcquirer'
    ).findOne(query)

    if (agent) {
      if (agent.merchant.acquirers.length) {
        acquirers = agent.merchant.acquirers
      }
    }

    msg.expressCreateResponse(
      res,
      acquirers ? msg.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msg.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      acquirers.map((acquirer) => {
        acquirer = acquirer.toJSON()
        acquirer._handler = trxManager.getAcquirerInfo(acquirer.acquirerConfig.handler)
        return acquirer
      })
    )
  }
}
