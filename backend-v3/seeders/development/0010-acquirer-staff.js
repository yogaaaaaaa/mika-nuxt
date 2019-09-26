'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('acquirerStaff', [
      {
        id: 1,
        name: 'Norman Threshold',
        userId: 201,
        acquirerCompanyId: 1
      },
      {
        id: 2,
        name: 'Jumping Jumpy',
        userId: 202,
        acquirerCompanyId: 1
      },
      {
        id: 3,
        name: 'James Unclean',
        userId: 203,
        acquirerCompanyId: 2
      },
      {
        id: 4,
        name: 'Solder Wick',
        userId: 204,
        acquirerCompanyId: 2
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerStaff', null, {})
  }
}
