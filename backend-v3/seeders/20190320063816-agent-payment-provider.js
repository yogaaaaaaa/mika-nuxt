'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('agentPaymentProvider', [
      {
        agentId: 1,
        paymentProviderId: 1
      },
      {
        agentId: 1,
        paymentProviderId: 2
      },
      {
        agentId: 1,
        paymentProviderId: 3
      },
      {
        agentId: 1,
        paymentProviderId: 4
      },
      {
        agentId: 1,
        paymentProviderId: 5
      },
      {
        agentId: 1,
        paymentProviderId: 6
      },
      {
        agentId: 1,
        paymentProviderId: 7
      },
      {
        agentId: 1,
        paymentProviderId: 8
      },
      {
        agentId: 1,
        paymentProviderId: 9
      },

      {
        agentId: 2,
        paymentProviderId: 1
      },
      {
        agentId: 2,
        paymentProviderId: 2
      },
      {
        agentId: 2,
        paymentProviderId: 3
      },
      {
        agentId: 2,
        paymentProviderId: 4
      },

      {
        agentId: 3,
        paymentProviderId: 1
      },
      {
        agentId: 3,
        paymentProviderId: 2
      },
      {
        agentId: 3,
        paymentProviderId: 3
      },
      {
        agentId: 3,
        paymentProviderId: 3
      },
      {
        agentId: 3,
        paymentProviderId: 4
      },

      {
        agentId: 4,
        paymentProviderId: 1
      },
      {
        agentId: 4,
        paymentProviderId: 2
      },
      {
        agentId: 4,
        paymentProviderId: 3
      },
      {
        agentId: 4,
        paymentProviderId: 4
      },

      {
        agentId: 5,
        paymentProviderId: 1
      },
      {
        agentId: 5,
        paymentProviderId: 2
      },

      {
        agentId: 6,
        paymentProviderId: 1
      },
      {
        agentId: 6,
        paymentProviderId: 2
      }
    ]
    , {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('agentPaymentProvider', null, {})
  }
}
