'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('acquirerConfigKv', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        acquirerConfigId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerConfig',
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
      await queryInterface.addIndex('acquirerConfigKv', { fields: ['acquirerConfigId', 'name'], unique: true, transaction: t })
      await queryInterface.addIndex('acquirerConfigKv', { fields: ['value'], transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('acquirerConfigKv')
  }
}
