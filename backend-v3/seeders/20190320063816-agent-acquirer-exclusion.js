'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentAcquirerExclusion', [
      {
        agentId: 15,
        acquirerId: 13
      },
      {
        agentId: 15,
        acquirerId: 14
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentAcquirerExclusion', null, {})
  }
}
