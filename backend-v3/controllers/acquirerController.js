'use strict'

const trxManager = require('../libs/trxManager')
const msg = require('../libs/msg')
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

    msg.expressGetEntityResponse(
      res,
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

    msg.expressGetEntityResponse(
      res,
      acquirers.map((acquirer) => {
        acquirer = acquirer.toJSON()
        acquirer._handler = trxManager.getAcquirerInfo(acquirer.acquirerConfig.handler)
        return acquirer
      })
    )
  }
}

/**
 * Get one or many merchant staff acquirers (via `req.auth.merchantStaffId`)
 */
module.exports.getMerchantStaffAcquirers = async (req, res, next) => {
  let query = {
    where: {
      id: req.auth.merchantStaffId
    }
  }

  if (req.params.acquirerId) {
    let acquirer = null

    let merchantStaff = await models.merchantStaff.scope(
      { method: ['merchantStaffAcquirer', req.params.acquirerId] }
    ).findOne(query)

    if (merchantStaff) {
      if (merchantStaff.merchant.acquirers.length) {
        acquirer = merchantStaff.merchant.acquirers[0]
      }
    }
    msg.expressGetEntityResponse(
      res,
      acquirer
    )
  } else {
    let acquirers = null

    let merchantStaff = await models.merchantStaff.scope(
      'merchantStaffAcquirer'
    ).findOne(query)

    if (merchantStaff) {
      if (merchantStaff.merchant.acquirers.length) {
        acquirers = merchantStaff.merchant.acquirers
      }
    }

    msg.expressGetEntityResponse(
      res,
      acquirers
    )
  }
}
