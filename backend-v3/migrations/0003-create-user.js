'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      username: {
        allowNull: false,
        unique: true,
        type: Sequelize.CHAR(64, true)
      },
      password: {
        allowNull: false,
        type: Sequelize.CHAR(64, true)
      },

      secure: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },

      userType: {
        allowNull: false,
        type: Sequelize.CHAR(32)
      },
      userRoles: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('user')
  }
}
