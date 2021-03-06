'use strict'

const uid = require('./uid')

module.exports.transactions = async (
  {
    agentIds,
    acquirerIds,
    dateStart,
    dateEnd,
    count = 100,
    amountMin = 100,
    amountMax = 5000000,
    statuses = ['success', 'failed']
  } = {}
) => {
  const result = []

  const timestampDiff = dateEnd.getTime() - dateStart.getTime()

  while (count) {
    const genId = await uid.generateTransactionId()
    const createdAtTimestamp = Math.round(dateStart.getTime() + (Math.random() * timestampDiff))
    const updatedAtTimestamp = Math.round(createdAtTimestamp + (Math.random() * (200 * 1000)))

    result.push({
      id: genId.id,
      idAlias: genId.idAlias,
      amount: Math.round(amountMin + (Math.random() * amountMax)),
      status: statuses[Math.round((Math.random() * (statuses.length - 1)))],
      agentId: agentIds[Math.round((Math.random() * (agentIds.length - 1)))],
      acquirerId: acquirerIds[Math.round((Math.random() * (acquirerIds.length - 1)))],
      createdAt: new Date(createdAtTimestamp),
      updatedAt: new Date(updatedAtTimestamp)
    })
    count--
  }
  return result
}
