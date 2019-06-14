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
        name: 'Happy New Shop',
        streetAddress: 'Jalan Rumah York Testing Nomor 4500',
        phoneNumber: '0213182940',
        merchantId: 1
      },
      {
        id: 3,
        name: 'The Olde Shop',
        streetAddress: 'Jalan Rumah York Testing Nomor 4500',
        phoneNumber: '0213182940',
        merchantId: 1
      },

      {
        id: 10,
        name: 'Shop Evil',
        streetAddress: 'Jalan Rumah Kilo Testing Nomor 3849',
        phoneNumber: '1209380918',
        merchantId: 2
      },
      {
        id: 11,
        name: 'Shop Good',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 2312',
        phoneNumber: '0213182938',
        merchantId: 2
      },

      {
        id: 21,
        name: 'Koperasi Karya Anak Asing - Pusat',
        streetAddress: 'Jalan Lempar Juara Testing Nomor 3',
        phoneNumber: '123871928',
        merchantId: 3
      },

      {
        id: 31,
        name: 'Pasar Angkasa Jayagiri',
        streetAddress: 'Jalan Kuat Lemah Testing Nomor 89',
        phoneNumber: '904587398',
        merchantId: 4
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('outlet', null, {})
  }
}
