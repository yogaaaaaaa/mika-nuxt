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
        outletId: 1
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
        outletId: 2
      },
      {
        id: 6,
        name: 'Agent Maju Tembak 6',
        userId: 26,
        outletId: 3
      },
      {
        id: 7,
        name: 'Agent Maju Tembak 7',
        userId: 27,
        outletId: 4
      },
      {
        id: 8,
        name: 'Agent Maju Tembak 8',
        userId: 28,
        outletId: 5
      },
      {
        id: 9,
        name: 'Agent Maju Tembak 9',
        userId: 29,
        outletId: 5
      },

      {
        id: 21,
        name: 'Agent Super Moe 1',
        userId: 30,
        outletId: 10
      },
      {
        id: 22,
        name: 'Agent Super Moe 2',
        userId: 31,
        outletId: 10
      },
      {
        id: 23,
        name: 'Agent Super Moe 3',
        userId: 32,
        outletId: 11
      },
      {
        id: 24,
        name: 'Agent Super Moe 4',
        userId: 33,
        outletId: 11
      },
      {
        id: 25,
        name: 'Agent Super Moe 5',
        userId: 34,
        outletId: 11
      },

      {
        id: 31,
        name: 'Agent Karya Anak Asing',
        outletId: 21
      },
      {
        id: 32,
        name: 'Sayur Keliling Jayagiri 1',
        outletId: 31
      },
      {
        id: 33,
        name: 'Sayur Keliling Jayagiri 2',
        outletId: 31
      },

      {
        id: 91,
        name: 'Agent Mika Store Jakarta Utara',
        userId: 91,
        outletId: 91
      },
      {
        id: 92,
        name: 'Agent Mika Store Jakarta Utara 2',
        userId: 92,
        outletId: 91
      },
      {
        id: 93,
        name: 'Agent Mika Store Jakarta Timur',
        userId: 93,
        outletId: 92
      },
      {
        id: 94,
        name: 'Agent Mika Store Jakarta Timur 2',
        userId: 94,
        outletId: 92
      },
      {
        id: 95,
        name: 'Agent Mika Store Jakarta Selatan',
        userId: 95,
        outletId: 93
      },
      {
        id: 96,
        name: 'Agent Mika Store Jakarta Barat',
        userId: 96,
        outletId: 94
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agent', null, {})
  }
}
