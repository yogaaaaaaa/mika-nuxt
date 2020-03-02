'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transactionRefund', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(27)
      },

      transactionId: {
        allowNull: false,
        type: Sequelize.STRING(27),
        references: {
          model: 'transaction',
          key: 'id'
        }
      },

      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(28, 2)
      },

      reference: {
        type: Sequelize.STRING
      },
      referenceName: {
        type: Sequelize.STRING
      },

      reason: {
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
    return queryInterface.dropTable('transactionRefund')
  }
}
