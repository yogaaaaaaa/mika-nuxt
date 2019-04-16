'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('outletMerchantStaff', [
      {
        outletId: 1,
        merchantStaffId: 1
      },

      {
        outletId: 2,
        merchantStaffId: 2
      },
      {
        outletId: 3,
        merchantStaffId: 2
      },
      {
        outletId: 3,
        merchantStaffId: 3
      },

      {
        outletId: 4,
        merchantStaffId: 4
      },
      {
        outletId: 5,
        merchantStaffId: 5
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('outletMerchantStaff', null, {})
  }
}
