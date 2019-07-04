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
        name: 'Ye Olde Shop',
        streetAddress: 'Jalan Rumah Mega Testing Nomor 4510',
        phoneNumber: '0213182940',
        merchantId: 1
      },
      {
        id: 4,
        name: 'Gamma Mart',
        streetAddress: 'Jalan Rumah Queens Testing Nomor 1',
        phoneNumber: '0214532310',
        merchantId: 1
      },
      {
        id: 5,
        name: 'Maju Mart',
        streetAddress: 'Jalan Rumah Queens Testing Nomor 2',
        phoneNumber: '0214532310',
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
        phoneNumber: '293912732',
        merchantId: 4
      },

      {
        id: 91,
        name: 'Mika Store Jakarta Utara',
        streetAddress: 'Jalan Besar Testing Nomor 91',
        phoneNumber: '555-284345',
        merchantId: 5
      },
      {
        id: 92,
        name: 'Mika Store Jakarta Timur',
        streetAddress: 'Jalan Jendral Hartono Nomor 123',
        phoneNumber: '555-324857',
        merchantId: 5
      },
      {
        id: 93,
        name: 'Mika Store Jakarta Selatan',
        streetAddress: 'Jalan Arus Kuat Nomor 120A',
        phoneNumber: '555-435938',
        merchantId: 5
      },
      {
        id: 94,
        name: 'Mika Store Jakarta Barat',
        streetAddress: 'Jalan Arus Rendah Nomor 15MA',
        phoneNumber: '555-254384',
        merchantId: 5
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('outlet', null, {})
  }
}
