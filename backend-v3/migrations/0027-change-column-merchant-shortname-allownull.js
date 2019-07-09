'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('merchant', 'shortName', {
      allowNull: true,
      unique: true,
      type: Sequelize.CHAR(25, true)
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('merchant', 'shortName', {
      allowNull: false,
      unique: true,
      type: Sequelize.CHAR(25, true)
    })
  }
}
