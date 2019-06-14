'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('merchantStaffOutlet', {
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
      await queryInterface.addIndex('merchantStaffOutlet', ['merchantStaffId', 'outletId'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('merchantStaffOutlet')
  }
}
