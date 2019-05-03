'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('paymentProviderConfigKv', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        paymentProviderConfigId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'paymentProviderConfig',
            key: 'id'
          }
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        value: {
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
      }, { transaction: t })
      await queryInterface.addIndex('paymentProviderConfigKv', ['paymentProviderConfigId', 'name'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('paymentProviderConfigKv')
  }
}
