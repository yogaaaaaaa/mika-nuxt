'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('acquirerConfig', [
      {
        id: 1,
        name: 'Tcash/LinkAja Default configuration',
        handler: 'tcash'
      },
      {
        id: 2,
        name: 'Midtrans GOPAY Default Sandbox configuration',
        handler: 'midtrans'
      },
      {
        id: 3,
        name: 'Alto (WeChat Pay/Alipay) Default Configuration',
        handler: 'alto'
      },
      {
        id: 10,
        name: 'Fairpay Default Configuration',
        handler: 'fairpay'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerConfig', null, {})
  }
}
