'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('merchantAcquirerType', {
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
      acquirerTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'acquirerType',
          key: 'id'
        }
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
    return queryInterface.dropTable('merchantAcquirerType')
  }
}
