'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('acquirerConfigOutlet', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        config: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },

        acquirerConfigId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerConfig',
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

        archivedAt: {
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
      await queryInterface.addIndex('acquirerConfigOutlet', ['acquirerConfigId', 'outletId'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('acquirerCompany')
  }
}
