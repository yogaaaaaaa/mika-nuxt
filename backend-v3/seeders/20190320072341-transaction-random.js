'use strict'

const fake = require('../libs/fake')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const startDate = new Date('2017-01-01T00:00:00.000Z')
    const endDate = new Date()

    const generateMerchant1 = (count = 100) => fake.transactions(
      'majutembak',
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4],
      startDate,
      endDate,
      count
    )

    const generateMerchant2 = (count = 100) => fake.transactions(
      'agromesupermoe',
      [11, 12, 13, 14, 15],
      [11, 12, 13, 14],
      startDate,
      endDate,
      count
    )

    let count = 200
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant1(), {})
      count--
    }

    count = 120
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant2(), {})
      count--
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('transaction', null, {})
  }
}
