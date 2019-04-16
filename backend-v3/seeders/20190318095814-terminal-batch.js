'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('terminalBatch', [
      {
        id: 1,
        name: 'First Batch',
        batchStatus: 'arrived',
        createdAt: new Date('2018-12-01T08:00:20.001Z'),
        updatedAt: new Date('2019-01-01T08:00:20.001Z')
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terminalBatch', null, {})
  }
}
