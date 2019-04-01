'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('apiKey', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      apiIdKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      apiSecretKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      apiSharedKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      partnerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'partner',
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
    return queryInterface.dropTable('apiKey')
  }
}
