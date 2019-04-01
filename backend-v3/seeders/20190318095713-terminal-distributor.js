'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('terminalDistributor', [
      {
        id: 1,
        name: 'Sunmi Indonesia',
        description: 'Sunmi Distributor Indonesia',
        address: 'Jalan Alfa Testing Nomor 102 Kota Boks',
        email: 'distributor@example.com',
        phoneNumber: '0213980980'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terminalDistributor', null, {})
  }
}
