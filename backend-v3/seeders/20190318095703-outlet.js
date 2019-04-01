'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('outlet', [
      {
        id: 1,
        name: 'Food New Land',
        streetAddress: 'Jalan Rumah Kilo Testing Nomor 1293',
        phoneNumber: '0213182938',
        merchantId: 1
      },
      {
        id: 2,
        name: 'Shop Evil',
        streetAddress: 'Jalan Rumah Kilo Testing Nomor 3849',
        phoneNumber: '1209380918',
        merchantId: 2
      },
      {
        id: 3,
        name: 'Shop Good',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 2312',
        phoneNumber: '0213182938',
        merchantId: 2
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('outlet', null, {})
  }
}
