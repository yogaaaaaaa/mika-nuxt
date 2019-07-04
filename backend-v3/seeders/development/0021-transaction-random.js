'use strict'

const fake = require('../../libs/fake')
const timer = require('../../libs/timer')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const startDate = new Date('2017-01-01T00:00:00.000Z')
    const endDate = new Date()

    const generateMerchant1 = (count = 100) => fake.transactions(
      'majutembak',
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4],
      startDate,
      endDate,
      count
    )

    const generateMerchant2 = (count = 100) => fake.transactions(
      'agromesupermoe',
      [21, 22, 23, 24, 25],
      [11, 12, 13, 14],
      startDate,
      endDate,
      count
    )

    const generateMerchant5 = (count = 100) => fake.transactions(
      'mika',
      [91, 92, 93, 94, 95, 96],
      [91, 92, 93, 94, 95, 96],
      startDate,
      endDate,
      count
    )

    let count = 100
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant1(), {})
      await timer.delay(100)
      count--
    }

    count = 100
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant2(), {})
      await timer.delay(100)
      count--
    }

    count = 300
    while (count) {
      await queryInterface.bulkInsert('transaction', generateMerchant5(), {})
      await timer.delay(100)
      count--
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('transaction', null, {})
  }
}
