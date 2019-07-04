'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentAcquirerExclusion', [
      {
        agentId: 8,
        acquirerId: 5
      },
      {
        agentId: 8,
        acquirerId: 6
      },
      {
        agentId: 9,
        acquirerId: 5
      },
      {
        agentId: 9,
        acquirerId: 6
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentAcquirerExclusion', null, {})
  }
}
