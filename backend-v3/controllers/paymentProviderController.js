'use strict'

const trxManager = require('../helpers/trxManager')
const msgFactory = require('../helpers/msgFactory')
const models = require('../models')

function getPpHandler (handler) {
  let ppHandler = trxManager.findPpHandler(handler)
  return {
    name: ppHandler.name,
    classes: ppHandler.classes,
    properties: ppHandler.properties
  }
}

/**
 * Get one or many agent's payment providers (via `req.auth.userType`)
 */
module.exports.getAgentPaymentProviders = async (req, res, next) => {
  let query = {
    where: {
      id: req.auth.agentId
    }
  }

  if (req.params.paymentProviderId) {
    let paymentProvider = null

    let agent = await models.agent.scope(
      { method: ['agentPaymentProvider', req.params.paymentProviderId] }
    ).findOne(query)

    if (agent) {
      if (agent.merchant.paymentProviders.length) {
        paymentProvider = agent.merchant.paymentProviders[0]
        paymentProvider._handler = getPpHandler(paymentProvider.paymentProviderConfig.handler)
      }
    }
    msgFactory.expressCreateResponse(
      res,
      paymentProvider ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      paymentProvider
    )
  } else {
    let paymentProviders = null

    let agent = await models.agent.scope(
      'agentPaymentProvider'
    ).findOne(query)

    if (agent) {
      if (agent.merchant.paymentProviders.length) {
        paymentProviders = agent.merchant.paymentProviders
      }
    }

    msgFactory.expressCreateResponse(
      res,
      paymentProviders ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      paymentProviders.map((paymentProvider) => {
        paymentProvider = paymentProvider.toJSON()
        paymentProvider._handler = getPpHandler(paymentProvider.paymentProviderConfig.handler)
        return paymentProvider
      })
    )
  }
}
