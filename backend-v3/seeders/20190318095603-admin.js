'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('admin', [
      {
        id: 1,
        name: 'Lyndon B Johnson',
        userId: 1
      },
      {
        id: 2,
        name: 'Ho Chi Minh',
        userId: 2
      },
      {
        id: 3,
        name: 'Margaret Thatcher',
        userId: 3
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('admin', null, {})
  }
}
