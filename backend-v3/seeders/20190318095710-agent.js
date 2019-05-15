'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agent', [
      {
        id: 1,
        name: 'Agent Maju Tembak',
        userId: 7,
        merchantId: 1,
        outletId: 1
      },

      {
        id: 2,
        name: 'Agent Super Moe 1',
        userId: 8,
        merchantId: 2,
        outletId: 2
      },
      {
        id: 3,
        name: 'Agent Super Moe 2',
        userId: 9,
        merchantId: 2,
        outletId: 3
      },

      {
        id: 4,
        name: 'Agent Karya Anak Asing',
        merchantId: 3,
        outletId: 4
      },
      {
        id: 5,
        name: 'Sayur Keliling Jayagiri 1',
        merchantId: 4,
        outletId: 5
      },
      {
        id: 6,
        name: 'Sayur Keliling Jayagiri 2',
        merchantId: 4,
        outletId: 5
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agent', null, {})
  }
}
