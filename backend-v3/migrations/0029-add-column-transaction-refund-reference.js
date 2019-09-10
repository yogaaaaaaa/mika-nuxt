'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn('transactionRefund', 'reference', {
        allowNull: true,
        type: Sequelize.STRING
      }, { transaction: t })
      await queryInterface.addColumn('transactionRefund', 'referenceName', {
        allowNull: true,
        type: Sequelize.STRING
      }, { transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('transactionRefund', 'reference', { transaction: t })
      await queryInterface.removeColumn('transactionRefund', 'referenceName', { transaction: t })
    })
  }
}
