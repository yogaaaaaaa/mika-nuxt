'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('admin', [
      {
        name: 'Lyndon B Johnson',
        userId: 1
      },
      {
        name: 'Ho Chi Minh',
        userId: 2
      },
      {
        name: 'Margaret Thatcher',
        userId: 3
      },
      {
        name: 'Mikhail Gorbachev',
        userId: 4
      },
      {
        name: 'Sultan Ahmad Shah',
        userId: 5
      },
      {
        name: 'Suharto',
        userId: 6
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('admin', null, {})
  }
}
