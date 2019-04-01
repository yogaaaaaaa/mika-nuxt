'use strict'

/**
 * Providing various constant and function
 * to generate and map Public API Object, e.g transaction, agent, etc
 */

const models = require('../models')
const Op = models.sequelize.Op

const transactionManager = require('./transactionManager')

async function agentsIdOfMerchantIds (merchantIds) {
  const agentsData = await models.terminal.findAll({
    raw: true,
    where: { userId: { [Op.or]: merchantIds } },
    attributes: ['id']
  })

  if (agentsData) {
    let agentsId = []
    for (let agentData of agentsData) {
      agentsId.push(agentData.id)
    }
    return agentsId
  } else {
    return []
  }
}

module.exports.mapTransactionObject = (transactionData) => {
  let transactionObject = {}

  transactionObject.transactionId = String(transactionData.id)

  transactionObject.agent = {}
  transactionObject.agent.agentId = String(transactionData.terminal.id)
  transactionObject.agent.agentName = transactionData.terminal.fullname

  transactionObject.paymentGateway = {}
  transactionObject.paymentGateway.paymentGatewayId = String(transactionData.payment_gateway.id)
  transactionObject.paymentGateway.paymentGatewayName = transactionData.payment_gateway.name
  transactionObject.paymentGateway.minimumAmount = transactionData.payment_gateway.minimum_transaction

  transactionObject.transactionStatus = transactionData.transaction_status.name.toLowerCase()
  transactionObject.tokenType = (transactionManager.findPgHandlers(transactionData.payment_gateway.name)).tokenType
  transactionObject.token = transactionData.qrcode || transactionData.midtrans_qrcode
  transactionObject.amount = parseInt(transactionData.amount)

  transactionObject.createdAt = transactionData.created_at

  if (transactionData.updated_at) {
    transactionObject.updatedAt = transactionData.updated_at
  }

  return transactionObject
}

module.exports.mapCreatedTransactionObject = (createdTransaction) => {
  let createdTransactionObject = {}

  createdTransactionObject.transactionId = String(createdTransaction.transactionData.id)

  createdTransactionObject.agentId = String(createdTransaction.transactionData.terminalId)

  createdTransactionObject.tokenType = createdTransaction.type
  createdTransactionObject.token = createdTransaction.token
  createdTransactionObject.amount = parseInt(createdTransaction.transactionData.amount)

  createdTransactionObject.createdAt = createdTransaction.transactionData.created_at

  return createdTransactionObject
}

module.exports.mapAgentObject = (terminalData) => {
  let agentObject = {}

  agentObject.agentId = String(terminalData.id)
  agentObject.agentName = terminalData.fullname
  agentObject.merchantId = terminalData.user.id

  agentObject.paymentGateways = []
  for (let pg of terminalData.user.merchant_payment_gateways) {
    agentObject.paymentGateways.push({
      paymentGatewayId: String(pg.payment_gateway.id),
      paymentGatewayName: pg.payment_gateway.name.toLowerCase(),
      minimumAmount: pg.payment_gateway.minimum_transaction
    })
  }

  return agentObject
}

module.exports.generateTransactionObject = async (transactionId, validMerchantsIds = null) => {
  const transactionData = await models.transaction.findOne({
    where: {
      id: transactionId
    },
    include: [
      models.terminal, models.payment_gateway, models.transaction_status
    ]
  })

  if (transactionData) {
    if (Array.isArray(validMerchantsIds)) {
      if (!(validMerchantsIds.includes(transactionData.terminal.userId) && validMerchantsIds.length > 0)) {
        return null
      }
    }

    return exports.mapTransactionObject(transactionData)
  } else {
    return null
  }
}

module.exports.generateTransactionObjectsByAgentId = async (agentId, page = 1, limit = 100) => {
  const transactionsData = await models.transaction.findAll({
    where: { terminalId: agentId },
    include: [
      models.terminal, models.payment_gateway, models.transaction_status
    ],
    offset: (page - 1) * limit,
    limit: limit
  })

  if (transactionsData) {
    let transactionsObject = []

    for (let transactionData of transactionsData) {
      transactionsObject.push(exports.mapTransactionObject(transactionData))
    }

    return transactionsObject
  } else {
    return null
  }
}

module.exports.generateTransactionObjectsByMerchantIds = async (merchantIds, page = 1, limit = 100) => {
  let agentIds = null

  if (Array.isArray(merchantIds)) {
    if (merchantIds.length === 0) {
      agentIds = [-1]
    } else {
      agentIds = await agentsIdOfMerchantIds(merchantIds)
    }
  }

  const transactionsData = await models.transaction.findAll({
    where: { terminalId: { [Op.or]: agentIds } },
    include: [
      models.terminal, models.payment_gateway, models.transaction_status
    ],
    offset: (page - 1) * limit,
    limit: limit
  })

  if (transactionsData) {
    let transactionsObject = []

    for (let transactionData of transactionsData) {
      transactionsObject.push(exports.mapTransactionObject(transactionData))
    }

    return transactionsObject
  } else {
    return null
  }
}

module.exports.generateAgentObject = async (agentId, validMerchantsIds = null) => {
  const terminalData = await models.terminal.findOne({
    where: { id: agentId },
    include: [ {
      model: models.user,
      include: [
        {
          model: models.merchant_payment_gateway,
          include: [
            {
              model: models.payment_gateway
            }
          ]
        }
      ]
    }]
  })

  if (terminalData) {
    if (Array.isArray(validMerchantsIds)) {
      if (!(validMerchantsIds.includes(terminalData.user.id) && validMerchantsIds.length > 0)) {
        return null
      }
    }

    return exports.mapAgentObject(terminalData)
  } else {
    return null
  }
}

module.exports.generateAgentObjectsByMerchantIds = async (merchantIds, page = 1, limit = 100) => {
  if (Array.isArray(merchantIds)) {
    if (merchantIds.length === 0) {
      merchantIds = [-1]
    }
  }

  const terminalsData = await models.terminal.findAll({
    where: { userId: { [Op.or]: merchantIds } },
    include: [ {
      model: models.user,
      include: [
        {
          model: models.merchant_payment_gateway,
          include: [
            {
              model: models.payment_gateway
            }
          ]
        }
      ]
    }],
    offset: (page - 1) * limit,
    limit: limit
  })

  if (terminalsData) {
    let terminalsObject = []

    for (let terminalData of terminalsData) {
      terminalsObject.push(exports.mapAgentObject(terminalData))
    }
    return terminalsObject
  } else {
    return []
  }
}
