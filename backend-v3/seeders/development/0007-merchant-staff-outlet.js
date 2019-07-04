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
        outletId: 3,
        merchantStaffId: 1
      },
      {
        outletId: 4,
        merchantStaffId: 1
      },
      {
        outletId: 5,
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
        outletId: 4,
        merchantStaffId: 3
      },
      {
        outletId: 5,
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
      },

      {
        outletId: 91,
        merchantStaffId: 91
      },
      {
        outletId: 92,
        merchantStaffId: 91
      },
      {
        outletId: 93,
        merchantStaffId: 91
      },
      {
        outletId: 94,
        merchantStaffId: 91
      },

      {
        outletId: 92,
        merchantStaffId: 92
      },
      {
        outletId: 93,
        merchantStaffId: 92
      },

      {
        outletId: 93,
        merchantStaffId: 93
      },

      {
        outletId: 94,
        merchantStaffId: 94
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchantStaffOutlet', null, {})
  }
}
