'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentAcquirerExclusion', [
      {
        agentId: 8,
        acquirerId: 1
      },
      {
        agentId: 8,
        acquirerId: 2
      },
      {
        agentId: 9,
        acquirerId: 9
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentAcquirerExclusion', null, {})
  }
}
