'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('acquirerTerminal', {
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

        mid: {
          allowNull: false,
          type: Sequelize.STRING
        },
        tid: {
          allowNull: false,
          type: Sequelize.STRING
        },

        traceNumberCounter: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER
        },

        type: {
          allowNull: false,
          type: Sequelize.STRING
        },
        config: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },

        acquirerTerminalCommonId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerTerminalCommon',
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
      })
      await queryInterface.addIndex('acquirerTerminal', ['mid', 'tid', 'acquirerTerminalCommonId'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('acquirerTerminal')
  }
}
