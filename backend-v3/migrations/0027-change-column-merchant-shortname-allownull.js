'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('merchant', 'shortName', {
      allowNull: true,
      type: Sequelize.CHAR(25, true)
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('merchant', 'shortName', {
      allowNull: false,
      type: Sequelize.CHAR(25, true)
    })
  }
}
