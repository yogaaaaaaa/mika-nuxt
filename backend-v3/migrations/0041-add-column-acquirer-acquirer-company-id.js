'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.addColumn('acquirer', 'acquirerCompanyId',
        {
          allowNull: true,
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerCompany',
            key: 'id'
          }
        },
        { transaction: t }
      )
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn('acquirer', 'acquirerCompanyId', { transaction: t })
    })
  }
}
