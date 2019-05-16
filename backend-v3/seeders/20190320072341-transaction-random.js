'use strict'

const uid = require('../helpers/uid')

function generateTransaction (
  merchantShortName,
  agentIds,
  acquirerIds,
  dateStart,
  dateEnd,
  count = 100,
  amountMin = 100,
  amountMax = 5000000,
  statuses = ['success', 'failed']
) {
  let result = []

  let timestampDiff = dateEnd.getTime() - dateStart.getTime()

  while (count) {
    let genId = uid.generateTransactionId(merchantShortName)
    let createdAtTimestamp = Math.round(dateStart.getTime() + (Math.random() * timestampDiff))
    let updatedAtTimestamp = Math.round(createdAtTimestamp + (Math.random() * (200 * 1000)))

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

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('run me')
    const generateMerchant1 = (count = 100) => generateTransaction(
      'majutembak',
      [1],
      [1, 2, 3, 4],
      new Date('2017-01-01T00:00:00.000Z'),
      new Date(),
      count
    )

    const generateMerchant2 = (count = 100) => generateTransaction(
      'agromesupermoe',
      [2, 3],
      [5, 6, 7, 8],
      new Date('2017-01-01T00:00:00.000Z'),
      new Date(),
      count
    )

    let count = 20
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant1(), {})
      count--
    }

    count = 12
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant2(), {})
      count--
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('transaction', null, {})
  }
}
