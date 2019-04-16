'use strict'

/**
 * TODO: This is a stub migration for terminalProcurement
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('terminalProcurement', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },

      procurementStatus: {
        allowNull: false,
        type: Sequelize.STRING
      },

      terminalModelId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'terminalModel',
          key: 'id'
        }
      },
      terminalCount: {
        allowNull: false,
        type: Sequelize.INTEGER
      },

      terminalDistributorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'terminalDistributor',
          key: 'id'
        }
      },

      terminalBatchId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'terminalBatch',
          key: 'id'
        }
      },

      adminId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'admin',
          key: 'id'
        }
      },

      deletedAt: {
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('terminalProcurement')
  }
}
