'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('agentAcquirerExclusion', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        agentId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'agent',
            key: 'id'
          }
        },
        acquirerId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirer',
            key: 'id'
          }
        },

        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction: t })
      await queryInterface.addIndex('agentAcquirerExclusion', ['agentId', 'acquirerId'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('agentAcquirerExclusion')
  }
}
