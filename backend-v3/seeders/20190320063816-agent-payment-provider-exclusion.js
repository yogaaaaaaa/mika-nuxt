'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentPaymentProviderExclusion', [
      {
        agentId: 3,
        paymentProviderId: 7
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentPaymentProviderExclusion', null, {})
  }
}
