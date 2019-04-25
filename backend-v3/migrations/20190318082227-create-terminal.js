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

      idAlias: {
        // allowNull: false,
        unique: true,
        type: Sequelize.CHAR(40)
      },

      name: {
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
      status: {
        allowNull: false,
        type: Sequelize.CHAR(32)
      },

      terminalModelId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'terminalModel',
          key: 'id'
        }
      },
      terminalBatchId: {
        allowNull: false,
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
