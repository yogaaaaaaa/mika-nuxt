'use strict'

/**
 * TODO: This is a stub migration for terminalBatch
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('terminalBatch', {
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

      batchStatus: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dateArrived: {
        allowNull: false,
        type: 'TIMESTAMP'
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
    return queryInterface.dropTable('terminalBatch')
  }
}
