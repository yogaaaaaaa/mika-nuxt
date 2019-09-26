'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.addColumn('transaction', 'processFee',
        {
          type: Sequelize.DECIMAL(28, 2)
        },
        { transaction: t })
      await queryInterface.addColumn('transaction', 'shareAcquirer',
        {
          type: Sequelize.DECIMAL(5, 4)
        },
        { transaction: t })
      await queryInterface.addColumn('transaction', 'shareMerchant',
        {
          type: Sequelize.DECIMAL(5, 4)
        },
        { transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn('transaction', 'processFee', { transaction: t })
      await queryInterface.removeColumn('transaction', 'shareAcquirer', { transaction: t })
      await queryInterface.removeColumn('transaction', 'shareMerchant', { transaction: t })
    })
  }
}
