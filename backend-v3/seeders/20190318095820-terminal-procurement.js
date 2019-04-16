'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('terminalProcurement', [
      {
        id: 1,
        description: 'Permintaan terminal v1 untuk merchant',
        procurementStatus: 'shipped',
        terminalDistributorId: 1,
        terminalModelId: 1,
        terminalCount: 5,
        terminalBatchId: 1,
        createdAt: new Date('2018-10-01T08:00:20.001Z'),
        updatedAt: new Date('2019-01-01T08:00:20.001Z')
      },
      {
        id: 2,
        description: 'Minta terminal !',
        procurementStatus: 'notApproved',
        terminalDistributorId: 1,
        terminalModelId: 2,
        terminalCount: 2500,
        createdAt: new Date('2018-09-01T08:00:20.001Z'),
        updatedAt: new Date('2018-09-02T09:10:20.001Z')
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terminalProcurement', null, {})
  }
}
