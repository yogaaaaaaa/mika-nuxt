'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cipherboxKey', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(27)
      },

      keys: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      master: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },

      terminalId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'terminal',
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cipherboxKey')
  }
}
