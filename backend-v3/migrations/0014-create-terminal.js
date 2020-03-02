'use strict'

// TODO: This is a stub migration for terminal

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('terminal', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        idAlias: {
          unique: true,
          type: Sequelize.STRING(25)
        },

        name: {
          type: Sequelize.STRING
        },
        description: {
          type: Sequelize.STRING
        },

        serialNumber: {
          type: Sequelize.STRING
        },
        imei: {
          type: Sequelize.STRING,
          unique: true
        },
        status: { // NOTE: Optional for now
          type: Sequelize.STRING(32)
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
          type: Sequelize.INTEGER,
          references: {
            model: 'terminalBatch',
            key: 'id'
          }
        },
        outletId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'outlet',
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
      }, { transaction: t })
      await queryInterface.addIndex('terminal', ['terminalModelId', 'serialNumber'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('terminal')
  }
}
