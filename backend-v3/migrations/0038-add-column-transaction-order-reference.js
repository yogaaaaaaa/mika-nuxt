'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('transaction', 'orderReference', {
      allowNull: true,
      type: Sequelize.STRING
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('transaction', 'orderReference')
  }
}
