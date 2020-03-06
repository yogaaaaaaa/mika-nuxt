'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('merchant', 'logo', {
      allowNull: true,
      type: Sequelize.TEXT
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('merchant', 'logo')
  }
}
