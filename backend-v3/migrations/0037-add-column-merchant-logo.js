'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('merchant', 'icon', {
      allowNull: true,
      type: Sequelize.TEXT
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('merchant', 'icon')
  }
}
