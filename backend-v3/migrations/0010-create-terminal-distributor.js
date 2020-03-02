'use strict'

// TODO: This is a stub migration for terminalDistributor

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('terminalDistributor', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },

      address: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('terminalDistributor')
  }
}
