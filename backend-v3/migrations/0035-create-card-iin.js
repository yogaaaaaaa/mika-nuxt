'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cardIin', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      pattern: {
        allowNull: false,
        type: Sequelize.STRING
      },

      priority: {
        allowNull: false,
        defaultValue: 1000,
        type: Sequelize.INTEGER
      },
      validation: {
        type: Sequelize.STRING
      },

      cardTypeId: {
        allowNull: false,
        type: Sequelize.STRING(64),
        references: {
          model: 'cardType',
          key: 'id'
        }
      },
      cardSchemeId: {
        allowNull: false,
        type: Sequelize.STRING(64),
        references: {
          model: 'cardScheme',
          key: 'id'
        }
      },
      cardIssuerId: {
        allowNull: false,
        type: Sequelize.STRING(64),
        references: {
          model: 'cardIssuer',
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
    return queryInterface.dropTable('cardIin')
  }
}
