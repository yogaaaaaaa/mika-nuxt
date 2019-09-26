'use strict'

module.exports.mapTransaction = (transaction) => {
  if (!transaction) return

  const mappedTransaction = {}

  mappedTransaction.transactionId = transaction.id

  mappedTransaction.agent = {}
  mappedTransaction.agent.agentId = String(transaction.agentId)
  mappedTransaction.agent.agentName = transaction.agent.name

  mappedTransaction.merchant = {}
  mappedTransaction.merchant.merchantId = String(transaction.agent.merchantId)
  mappedTransaction.merchant.merchantName = transaction.agent.merchant.name

  mappedTransaction.acquirer = {}
  mappedTransaction.acquirer.acquirerId = String(transaction.acquirerId)
  mappedTransaction.acquirer.acquirerName = transaction.acquirer.acquirerType.name
  mappedTransaction.acquirer.minimumAmount = transaction.acquirer.minimumAmount

  mappedTransaction.transactionStatus = transaction.status
  mappedTransaction.token = transaction.token
  mappedTransaction.tokenType = transaction.tokenType
  mappedTransaction.amount = transaction.amount

  mappedTransaction.createdAt = transaction.createdAt
  mappedTransaction.updatedAt = transaction.updatedAt

  return mappedTransaction
}

module.exports.mapCreatedTransaction = (trxCreateResult) => {
  if (!trxCreateResult) return

  const mappedTrxCreateResult = {}

  mappedTrxCreateResult.transactionId = trxCreateResult.transactionId
  mappedTrxCreateResult.agentId = String(trxCreateResult.agentId)
  mappedTrxCreateResult.transactionStatus = trxCreateResult.transactionStatus

  if (trxCreateResult.tokenType && trxCreateResult.token) {
    mappedTrxCreateResult.tokenType = trxCreateResult.tokenType
    mappedTrxCreateResult.token = trxCreateResult.token
  }

  mappedTrxCreateResult.amount = trxCreateResult.amount
  mappedTrxCreateResult.createdAt = trxCreateResult.createdAt

  return mappedTrxCreateResult
}

module.exports.mapAgent = (agent) => {
  if (!agent) return

  const mappedAgent = {}

  mappedAgent.agentId = String(agent.id)
  mappedAgent.agentName = agent.name

  mappedAgent.merchant = {}
  mappedAgent.merchant.merchantId = String(agent.merchantId)
  mappedAgent.merchant.merchantName = agent.merchant.name

  mappedAgent.acquirers = []
  for (const acquirer of agent.merchant.acquirers) {
    mappedAgent.acquirers.push({
      acquirerId: String(acquirer.id),
      acquirerName: acquirer.acquirerType.name,
      minimumAmount: acquirer.minimumAmount,
      maximumAmount: acquirer.maximumAmount
    })
  }

  return mappedAgent
}

module.exports.mapMerchant = (merchant) => {
  if (!merchant) return
  const mappedMerchant = {}

  mappedMerchant.merchantId = merchant.id
  mappedMerchant.merchantName = merchant.name

  return mappedMerchant
}
