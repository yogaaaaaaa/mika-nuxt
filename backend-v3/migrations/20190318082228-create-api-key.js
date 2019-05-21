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

      idKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      secretKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      sharedKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      partnerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'partner',
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
    return queryInterface.dropTable('apiKey')
  }
}
