'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('agent', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },

      generalLocationLong: {
        type: Sequelize.DECIMAL(12, 8)
      },
      generalLocationLat: {
        type: Sequelize.DECIMAL(12, 8)
      },
      generalLocationRadiusMeter: {
        type: Sequelize.DECIMAL(10, 2)
      },

      traceNumberCounter: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },

      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('agent')
  }
}
