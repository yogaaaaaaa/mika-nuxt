'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('agentAcquirerExclusion', {
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
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('agentAcquirerExclusion')
  }
}
