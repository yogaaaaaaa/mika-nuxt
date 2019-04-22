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
        userId: 4,
        merchantId: 1
      },

      {
        id: 2,
        name: 'Barrack Obama',
        email: 'president@example.org',
        idCardNumber: '6012389123120938',
        idCardType: 'KTP',
        occupation: 'ceo',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 3',
        userId: 5,
        merchantId: 2
      },
      {
        id: 3,
        name: 'Chidori Teresa',
        email: 'youtuber@example.org',
        idCardNumber: '2323891239912890',
        idCardType: 'SIM',
        occupation: 'manager',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 4',
        userId: 6,
        merchantId: 2
      },

      {
        id: 4,
        name: 'Carl Johnson .Jr',
        email: 'jumpjet@example.org',
        idCardNumber: '1293881230192834',
        idCardType: 'KTP',
        occupation: 'owner',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 5',
        merchantId: 3
      },

      {
        id: 5,
        name: 'Leeloominaï Lekatariba Lamina-Tchaï Ekbat De Sebat',
        email: 'multipass@example.org',
        idCardNumber: '3849283492837482',
        idCardType: 'KTP',
        occupation: 'owner',
        streetAddress: 'Jalan Rumah Tetra Testing Nomor 6',
        merchantId: 4
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('merchantStaff', null, {})
  }
}