'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('merchantStaffOutlet', [
      {
        outletId: 1,
        merchantStaffId: 1
      },
      {
        outletId: 2,
        merchantStaffId: 1
      },
      {
        outletId: 2,
        merchantStaffId: 2
      },
      {
        outletId: 3,
        merchantStaffId: 1
      },
      {
        outletId: 3,
        merchantStaffId: 3
      },

      {
        outletId: 10,
        merchantStaffId: 11
      },
      {
        outletId: 11,
        merchantStaffId: 11
      },
      {
        outletId: 11,
        merchantStaffId: 12
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchantStaffOutlet', null, {})
  }
}
