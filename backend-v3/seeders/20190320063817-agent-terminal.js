'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentTerminal', [
      {
        agentId: 1,
        terminalId: 1
      },
      {
        agentId: 3,
        terminalId: 2
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentTerminal', null, {})
  }
}
