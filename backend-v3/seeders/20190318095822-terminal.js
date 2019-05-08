'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('terminal', [
      {
        id: 1,
        idAlias: '778-005-A23R',
        name: 'Terminal 1',
        serialNumber: 'V111178552449',
        imei: '861299031757376',
        status: 'ready',
        terminalModelId: 2,
        terminalBatchId: 1,
        merchantId: 1
      },

      {
        id: 2,
        idAlias: '778-005-F453',
        name: 'Terminal 2',
        serialNumber: 'V111178552500',
        imei: '861299031757380',
        status: 'ready',
        terminalBatchId: 1,
        terminalModelId: 1,
        merchantId: 2
      },
      {
        id: 3,
        idAlias: '778-005-2ADR',
        name: 'Terminal 3',
        serialNumber: 'P111178552501',
        imei: '861299031757480',
        status: 'ready',
        terminalModelId: 2,
        terminalBatchId: 1,
        merchantId: 2
      },

      {
        id: 4,
        name: 'Terminal 4',
        serialNumber: 'V111178552520',
        imei: '861299031757590',
        status: 'arrived',
        terminalModelId: 1,
        terminalBatchId: 1
      },
      {
        id: 5,
        name: 'Terminal 5',
        serialNumber: 'P111178552700',
        imei: '861299031757510',
        status: 'arrived',
        terminalModelId: 2,
        terminalBatchId: 1
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terminal', null, {})
  }
}
