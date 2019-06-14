'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agent', [
      {
        id: 1,
        name: 'Agent Maju Tembak 1',
        userId: 21,
        outletId: 1
      },
      {
        id: 2,
        name: 'Agent Maju Tembak 2',
        userId: 22,
        outletId: 1
      },
      {
        id: 3,
        name: 'Agent Maju Tembak 3',
        userId: 23,
        outletId: 2
      },
      {
        id: 4,
        name: 'Agent Maju Tembak 4',
        userId: 24,
        outletId: 2
      },
      {
        id: 5,
        name: 'Agent Maju Tembak 5',
        userId: 25,
        outletId: 3
      },

      {
        id: 11,
        name: 'Agent Super Moe 1',
        userId: 26,
        outletId: 10
      },
      {
        id: 12,
        name: 'Agent Super Moe 2',
        userId: 27,
        outletId: 10
      },
      {
        id: 13,
        name: 'Agent Super Moe 3',
        userId: 28,
        outletId: 11
      },
      {
        id: 14,
        name: 'Agent Super Moe 4',
        userId: 29,
        outletId: 11
      },
      {
        id: 15,
        name: 'Agent Super Moe 5',
        userId: 30,
        outletId: 11
      },

      {
        id: 21,
        name: 'Agent Karya Anak Asing',
        outletId: 21
      },
      {
        id: 31,
        name: 'Sayur Keliling Jayagiri 1',
        outletId: 31
      },
      {
        id: 32,
        name: 'Sayur Keliling Jayagiri 2',
        outletId: 31
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agent', null, {})
  }
}
