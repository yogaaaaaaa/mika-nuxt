'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('paymentProviderConfig', [
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
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paymentProviderConfig', null, {})
  }
}
