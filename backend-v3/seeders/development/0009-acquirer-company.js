'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'acquirerCompany',
      [
        {
          id: 1,
          name: 'LinkAja'
        },
        {
          id: 2,
          name: 'Gopay'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerCompany', null, {})
  }
}
