'use strict'

const fake = require('../../libs/fake')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const startDate = new Date('2017-01-01T00:00:00.000Z')
    const endDate = new Date()

    const generateMerchant1 = async (count = 100) => fake.transactions(
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4],
      startDate,
      endDate,
      count
    )

    const generateMerchant2 = async (count = 100) => fake.transactions(
      [21, 22, 23, 24, 25],
      [11, 12, 13, 14],
      startDate,
      endDate,
      count
    )

    const generateMerchant5 = async (count = 100) => fake.transactions(
      [91, 92, 93, 94, 95, 96],
      [91, 92, 93, 94, 95, 96],
      startDate,
      endDate,
      count
    )

    let count = 100
    while (count) {
      await queryInterface.bulkInsert('transaction', await generateMerchant1(), {})
      count--
    }

    count = 100
    while (count) {
      await queryInterface.bulkInsert('transaction', await generateMerchant2(), {})
      count--
    }

    count = 300
    while (count) {
      await queryInterface.bulkInsert('transaction', await generateMerchant5(), {})
      count--
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('transaction', null, {})
  }
}
