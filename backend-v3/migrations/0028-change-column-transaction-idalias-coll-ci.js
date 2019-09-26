'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('transaction', 'idAlias', {
      allowNull: false,
      type: Sequelize.CHAR(40, false)
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('transaction', 'idAlias', {
      allowNull: false,
      type: Sequelize.CHAR(40, true)
    })
  }
}
