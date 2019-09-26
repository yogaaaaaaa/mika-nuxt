'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn('user', 'lastPasswords', {
        allowNull: true,
        type: Sequelize.STRING(1024)
      }, { transaction: t })
      await queryInterface.addColumn('user', 'lastLoginAttemptAt', {
        allowNull: true,
        type: Sequelize.DATE
      }, { transaction: t })
      await queryInterface.addColumn('user', 'lastPasswordChangeAt', {
        allowNull: true,
        type: Sequelize.DATE
      }, { transaction: t })
      await queryInterface.addColumn('user', 'failedLoginAttempt', {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      }, { transaction: t })
      await queryInterface.addColumn('user', 'followPasswordExpiry', {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      }, { transaction: t })
      await queryInterface.addColumn('user', 'followFailedLoginLockout', {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      }, { transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('user', 'lastPasswords', { transaction: t })
      await queryInterface.removeColumn('user', 'lastLoginAttemptAt', { transaction: t })
      await queryInterface.removeColumn('user', 'lastPasswordChangeAt', { transaction: t })
      await queryInterface.removeColumn('user', 'failedLoginAttempt', { transaction: t })
      await queryInterface.removeColumn('user', 'followPasswordExpiry', { transaction: t })
      await queryInterface.removeColumn('user', 'followFailedLoginLockout', { transaction: t })
    })
  }
}
