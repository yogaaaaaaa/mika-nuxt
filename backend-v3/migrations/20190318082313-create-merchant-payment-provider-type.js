'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('merchantPaymentProviderType', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      merchantId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'merchant',
          key: 'id'
        }
      },
      paymentProviderTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'paymentProviderType',
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
    return queryInterface.dropTable('merchantPaymentProviderType')
  }
}
