'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agent', [
      {
        id: 1,
        name: 'Agent Maju Tembak',
        boundedToTerminal: true,
        userId: 4,
        merchantId: 1,
        outletId: 1
      },

      {
        id: 2,
        name: 'Agent Super Moe 1',
        userId: 5,
        merchantId: 2,
        outletId: 2
      },
      {
        id: 3,
        name: 'Agent Super Moe 2',
        boundedToTerminal: true,
        userId: 6,
        merchantId: 2,
        outletId: 3
      },

      {
        id: 4,
        name: 'Agent Karya Anak Asing',
        merchantId: 3
      },
      {
        id: 5,
        name: 'Sayur Keliling Jayagiri 1',
        merchantId: 4
      },
      {
        id: 6,
        name: 'Sayur Keliling Jayagiri 2',
        merchantId: 4
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agent', null, {})
  }
}
