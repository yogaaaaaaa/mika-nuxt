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
          type: Sequelize.STRING(2048)
        }
      }, { transaction: t })
      await queryInterface.addIndex('paymentProviderConfigKv', { fields: ['paymentProviderConfigId', 'name'], unique: true, transaction: t })
      await queryInterface.addIndex('paymentProviderConfigKv', { fields: ['value'], transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('paymentProviderConfigKv')
  }
}
