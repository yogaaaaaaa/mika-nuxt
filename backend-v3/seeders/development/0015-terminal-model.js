'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('terminalModel', [
      {
        id: 1,
        name: 'V1',
        description: 'POS System with integrated thermal printer',
        manufacturer: 'Shanghai Sunmi Tech Co.,Ltd'
      },
      {
        id: 2,
        name: 'W6900 P1',
        description: 'POS System with integrated Card Reader (NFC, MSR, CHIP) and thermal printer',
        manufacturer: 'Shanghai Sunmi Tech Co.,Ltd'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terminalModel', null, {})
  }
}
