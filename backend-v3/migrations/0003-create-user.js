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
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },

      secure: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },

      lastPasswords: {
        type: Sequelize.STRING(1024)
      },
      lastLoginAttemptAt: {
        type: Sequelize.DATE
      },
      lastPasswordChangeAt: {
        type: Sequelize.DATE
      },
      failedLoginAttempt: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      followPasswordExpiry: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      followFailedLoginLockout: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },

      userType: {
        allowNull: false,
        type: Sequelize.STRING(32)
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
