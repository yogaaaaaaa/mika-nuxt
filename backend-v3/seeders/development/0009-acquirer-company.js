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
        },
        {
          id: 3,
          name: 'Bank BNI'
        },
        {
          id: 100,
          name: 'Kuma Pay'
        },
        {
          id: 101,
          name: 'Kuma Bank'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerCompany', null, {})
  }
}
