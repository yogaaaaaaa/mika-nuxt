'use strict'

/**
 * TODO: This is a stub migration for terminal
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('terminal', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },

      serialNumber: {
        type: Sequelize.STRING,
        unique: true
      },
      imei: {
        type: Sequelize.STRING,
        unique: true
      },
      terminalStatus: {
        allowNull: false,
        type: Sequelize.STRING
      },

      terminalModelId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'terminalModel',
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
      merchantId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'merchant',
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
    return queryInterface.dropTable('terminal')
  }
}
