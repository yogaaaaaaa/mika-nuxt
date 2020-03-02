'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('merchantStaff', [
      {
        id: 1,
        name: 'John Wick',
        email: 'wick.shot@example.com',
        idCardNumber: '2349813022309890',
        idCardType: 'KTP',
        occupation: 'owner',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 1',
        userId: 11,
        merchantId: 1
      },
      {
        id: 2,
        name: 'John McClane',
        email: 'yippe.shot@example.com',
        idCardNumber: '2909813023209881',
        idCardType: 'KTP',
        occupation: 'manager',
        streetAddress: 'Jalan Rumah Quad Testing Nomor 2',
        userId: 12,
        merchantId: 1
      },
      {
        id: 3,
        name: 'James Bond',
        email: 'notstir.shot@example.com',
        idCardNumber: '3009813044409871',
        idCardType: 'KTP',
        occupation: 'manager',
        streetAddress: 'Jalan Rumah Romeo Testing Nomor 10',
        userId: 13,
        merchantId: 1
      },

      {
        id: 11,
        name: 'Barrack Obama',
        email: 'president@example.org',
        idCardNumber: '6012389123120938',
        idCardType: 'KTP',
        occupation: 'ceo',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 3',
        userId: 14,
        merchantId: 2
      },
      {
        id: 12,
        name: 'Chidori Teresa',
        email: 'youtuber@example.org',
        idCardNumber: '2323891239912890',
        idCardType: 'SIM',
        occupation: 'manager',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 4',
        userId: 15,
        merchantId: 2
      },

      {
        id: 21,
        name: 'Carl Johnson .Jr',
        email: 'jumpjet@example.org',
        idCardNumber: '1293881230192834',
        idCardType: 'KTP',
        occupation: 'owner',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 5',
        merchantId: 3
      },

      {
        id: 31,
        name: 'Leeloominaï Lekatariba Lamina-Tchaï Ekbat De Sebat',
        email: 'multipass@example.org',
        idCardNumber: '3849283492837482',
        idCardType: 'KTP',
        occupation: 'owner',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 6',
        merchantId: 4
      },

      {
        id: 91,
        name: 'Mika Staff',
        email: 'mikastaff@getmika.id',
        userId: 101,
        merchantId: 5
      },
      {
        id: 92,
        name: 'Mika Staff 2',
        email: 'mikastaff2@getmika.id',
        userId: 102,
        merchantId: 5
      },
      {
        id: 93,
        name: 'Mika Staff 3',
        email: 'mikastaff3@getmika.id',
        userId: 103,
        merchantId: 5
      },
      {
        id: 94,
        name: 'Mika Staff 4',
        email: 'mikastaff4@getmika.id',
        userId: 104,
        merchantId: 5
      },

      {
        id: 500,
        name: 'Syamsu Fajar',
        email: 'syamsu@getmika.id',
        userId: 503,
        merchantId: 1
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchantStaff', null, {})
  }
}
