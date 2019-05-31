'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('merchantStaffOutlet', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      merchantStaffId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'merchantStaff',
          key: 'id'
        }
      },
      outletId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'outlet',
          key: 'id'
        }
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('merchantStaffOutlet')
  }
}
