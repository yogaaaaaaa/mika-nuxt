'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transactionRefund', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.CHAR(27, true)
      },

      amount: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      reason: {
        type: Sequelize.STRING
      },

      transactionId: {
        allowNull: false,
        type: Sequelize.CHAR(27, true),
        references: {
          model: 'transaction',
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
    return queryInterface.dropTable('transactionRefund')
  }
}
