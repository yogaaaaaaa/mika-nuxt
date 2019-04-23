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
      agentId: req.auth.agentId
    }
  }

  if (req.params.paymentProviderId) {
    query.where.paymentProviderId = req.params.paymentProviderId
    let agentPaymentProvider = await models.agentPaymentProvider.scope('agent').findOne(query)
    let paymentProvider = null

    if (agentPaymentProvider) {
      paymentProvider = agentPaymentProvider.paymentProvider
      paymentProvider._handler = getPpHandler(paymentProvider.paymentProviderConfig.handler)
    }
    msgFactory.expressCreateResponse(
      res,
      paymentProvider ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      paymentProvider
    )
  } else {
    let agentPaymentProviders = await models.agentPaymentProvider.scope('agent').findAll(query)
    msgFactory.expressCreateResponse(
      res,
      agentPaymentProviders ? msgFactory.msgTypes.MSG_SUCCESS_ENTITY_FOUND : msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND,
      agentPaymentProviders.map((data) => {
        let paymentProvider = data.paymentProvider.toJSON()
        paymentProvider._handler = getPpHandler(data.paymentProvider.paymentProviderConfig.handler)
        return paymentProvider
      })
    )
  }
}
