'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('transactionExtraKv', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        transactionId: {
          allowNull: false,
          type: Sequelize.CHAR(27, true),
          references: {
            model: 'transaction',
            key: 'id'
          }
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        value: {
          type: Sequelize.STRING
        }
      }, { transaction: t })
      await queryInterface.addIndex('transactionExtraKv', ['transactionId', 'name'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transactionExtraKv')
  }
}
