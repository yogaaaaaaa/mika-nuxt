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
        id: 4,
        name: 'QR Nasional (QRIS) via Tcash QRN Default Configuration',
        handler: 'tcashqrn'
      },
      {
        id: 10,
        name: 'Kuma Bank Default Configuration',
        handler: 'kumabank'
      },
      {
        id: 100,
        name: 'Kuma Pay Default configuration',
        handler: 'kumapay'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerConfig', null, {})
  }
}
