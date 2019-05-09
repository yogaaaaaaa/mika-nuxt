'use strict'

module.exports.mapTransaction = (transaction) => {
  if (!transaction) return

  let mappedTransaction = {}

  mappedTransaction.transactionId = transaction.id

  mappedTransaction.agent = {}
  mappedTransaction.agent.agentId = String(transaction.agentId)
  mappedTransaction.agent.agentName = transaction.agent.name

  mappedTransaction.merchant = {}
  mappedTransaction.merchant.merchantId = String(transaction.agent.merchantId)
  mappedTransaction.merchant.merchantName = transaction.agent.merchant.name

  mappedTransaction.paymentProvider = {}
  mappedTransaction.paymentProvider.paymentProviderId = String(transaction.paymentProviderId)
  mappedTransaction.paymentProvider.paymentProviderName = transaction.paymentProvider.paymentProviderType.name
  mappedTransaction.paymentProvider.minimumAmount = transaction.paymentProvider.minimumAmount

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

  let mappedTrxCreateResult = {}

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

  let mappedAgent = {}

  mappedAgent.agentId = String(agent.id)
  mappedAgent.agentName = agent.name

  mappedAgent.merchant = {}
  mappedAgent.merchant.merchantId = String(agent.merchantId)
  mappedAgent.merchant.merchantName = agent.merchant.name

  mappedAgent.paymentProviders = []
  for (let paymentProvider of agent.merchant.paymentProviders) {
    mappedAgent.paymentProviders.push({
      paymentProviderId: String(paymentProvider.id),
      paymentProviderName: paymentProvider.paymentProviderType.name,
      minimumAmount: paymentProvider.minimumAmount,
      maximumAmount: paymentProvider.maximumAmount
    })
  }

  return mappedAgent
}

module.exports.mapMerchant = (merchant) => {
  if (!merchant) return
  let mappedMerchant = {}

  mappedMerchant.merchantId = merchant.id
  mappedMerchant.merchantName = merchant.name

  return mappedMerchant
}
