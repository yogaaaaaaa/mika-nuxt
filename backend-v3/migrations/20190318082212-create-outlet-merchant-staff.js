'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('outletMerchantStaff', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      outletId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'outlet',
          key: 'id'
        }
      },
      merchantStaffId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'merchantStaff',
          key: 'id'
        }
      },

      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
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
    return queryInterface.dropTable('outletMerchantStaff')
  }
}
