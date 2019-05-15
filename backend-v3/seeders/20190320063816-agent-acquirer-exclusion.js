'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentAcquirerExclusion', [
      {
        agentId: 3,
        acquirerId: 7
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentAcquirerExclusion', null, {})
  }
}
