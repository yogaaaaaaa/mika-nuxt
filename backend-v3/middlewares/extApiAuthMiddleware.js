'use strict'

const extApiKeyAuth = require('../helpers/extApiKeyAuth')
const msgFactory = require('../helpers/msgFactory')
const models = require('../models')

module.exports.apiAuth = async function (req, res, next) {
  req.apiAuth = null
  try {
    let authComponent = req.headers['authorization'].split(' ')
    if (authComponent[0].toLowerCase() === 'bearer') {
      req.apiAuth = await extApiKeyAuth.verifyClientApiToken(authComponent[1])
    }
  } catch (err) {}
  next()
}

module.exports.apiAuthErrorHandler = async function (req, res, next) {
  if (req.apiAuth === null) {
    res.status(401)
      .send(
        msgFactory.generateExtApiResponseMessage(msgFactory.msgTypes.MSG_ERROR_AUTH)
      )
  } else {
    next()
  }
}

async function checkIfAgentIdValid (agentId, validMerchantIds) {
  try {
    let agent = await models.terminal.findOne({
      raw: true,
      where: { id: agentId },
      attributes: ['id', ['userId', 'merchantId']]
    })

    if (agent) {
      if (validMerchantIds.includes(agent.merchantId)) {
        return true
      }
    }
  } catch (err) {}

  return false
}

module.exports.checkIfAgentIdValidInBody = async (req, res, next) => {
  req.validAgentId = false
  if (req.apiAuth && req.body.agentId) {
    req.validAgentId = await checkIfAgentIdValid(req.body.agentId, req.apiAuth.merchantIds)
  }
  next()
}

module.exports.checkIfAgentIdValidInParams = async (req, res, next) => {
  req.validAgentId = false
  if (req.apiAuth && req.params.agentId) {
    req.validAgentId = await checkIfAgentIdValid(req.params.agentId, req.apiAuth.merchantIds)
  }
  next()
}

module.exports.invalidTransactionIdHandler = async (req, res, next) => {
  if (!req.validTransactionId) {
    res.status(404).send(
      msgFactory.generateExtApiResponseMessage(
        msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND
      )
    )
    return
  }
  next()
}

async function checkIfTransactionIdValid (transactionId, validMerchantIds) {
  try {
    let transaction = await models.transaction.findOne({
      where: { id: transactionId },
      attributes: ['id'],
      include: [
        {
          model: models.terminal,
          attributes: ['id'],
          include: [
            {
              model: models.user,
              attributes: ['id']
            }
          ]
        }
      ]
    })

    if (transaction) {
      if (validMerchantIds.includes(transaction.terminal.user.id)) {
        return true
      }
    }
  } catch (err) {}

  return false
}

module.exports.checkIfTransactionIdValidInBody = async (req, res, next) => {
  req.validTransactionId = false
  if (req.apiAuth && req.body.transactionId) {
    req.validTransactionId = await checkIfTransactionIdValid(req.body.transactionId, req.apiAuth.merchantIds)
  }
  next()
}

module.exports.checkIfTransactionIdValidInParams = async (req, res, next) => {
  req.validTransactionId = false
  if (req.apiAuth && req.params.transactionId) {
    req.validTransactionId = await checkIfTransactionIdValid(req.params.transactionId, req.apiAuth.merchantIds)
  }
  next()
}

module.exports.invalidAgentIdHandler = async (req, res, next) => {
  if (!req.validAgentId) {
    res.status(404).send(
      msgFactory.generateExtApiResponseMessage(
        msgFactory.msgTypes.MSG_SUCCESS_ENTITY_NOT_FOUND
      )
    )
    return
  }
  next()
}
