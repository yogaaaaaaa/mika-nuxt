'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('partner', [
      {
        id: 1,
        name: 'Super Partner',
        email: 'partner@example.com',
        website: 'www.partner.example.com',
        streetAddress: 'Jalan Romeo Testing Nomor 56 Kota Segitiga',
        bankName: 'Mandiri',
        bankAccountName: 'Rose Dawson',
        bankAccountNumber: '2138471209834'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('partner', null, {})
  }
}
