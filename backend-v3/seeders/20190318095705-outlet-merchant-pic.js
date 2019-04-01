'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('outletMerchantPic', [
      {
        outletId: 1,
        merchantPicId: 1
      },
      {
        outletId: 2,
        merchantPicId: 2
      },
      {
        outletId: 2,
        merchantPicId: 3
      },
      {
        outletId: 3,
        merchantPicId: 2
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('outletMerchantPic', null, {})
  }
}
