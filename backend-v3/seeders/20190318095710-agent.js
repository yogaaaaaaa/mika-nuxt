'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agent', [
      {
        id: 1,
        name: 'Agent Maju Tembak',
        userId: 7,
        outletId: 1
      },

      {
        id: 2,
        name: 'Agent Super Moe 1',
        userId: 8,
        outletId: 2
      },
      {
        id: 3,
        name: 'Agent Super Moe 2',
        userId: 9,
        outletId: 3
      },

      {
        id: 4,
        name: 'Agent Karya Anak Asing',
        outletId: 4
      },
      {
        id: 5,
        name: 'Sayur Keliling Jayagiri 1',
        outletId: 5
      },
      {
        id: 6,
        name: 'Sayur Keliling Jayagiri 2',
        outletId: 5
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agent', null, {})
  }
}
