'use strict'

const fake = require('../helpers/fake')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('run me')
    const generateMerchant1 = (count = 100) => fake.transactions(
      'majutembak',
      [1],
      [1, 2, 3, 4],
      new Date('2017-01-01T00:00:00.000Z'),
      new Date(),
      count
    )

    const generateMerchant2 = (count = 100) => fake.transactions(
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
