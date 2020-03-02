'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('acquirerConfigAgent', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        acquirerConfigId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerConfig',
            key: 'id'
          }
        },
        agentId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'agent',
            key: 'id'
          }
        },
        acquirerTerminalId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerTerminal',
            key: 'id'
          }
        },
        latestSettleBatchId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'settleBatch',
            key: 'id'
          }
        },

        batchNumberCounter: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER
        },

        config: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },

        archivedAt: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: null
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
      await queryInterface.addIndex('acquirerConfigAgent', ['acquirerConfigId', 'agentId'], { unique: true, transaction: t })
      await queryInterface.addIndex('acquirerConfigAgent', ['acquirerConfigId', 'acquirerTerminalId'], { unique: true, transaction: t })
      await queryInterface.addIndex('acquirerConfigAgent', ['acquirerConfigId', 'agentId', 'acquirerTerminalId'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('acquirerConfigAgent')
  }
}
