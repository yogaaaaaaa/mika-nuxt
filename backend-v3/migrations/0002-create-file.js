'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('file', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(27)
      },

      originalFilename: {
        allowNull: false,
        type: Sequelize.STRING
      },
      hash: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      mime: {
        allowNull: false,
        defaultValue: 'application/octet-stream',
        type: Sequelize.STRING
      },
      size: {
        allowNull: false,
        type: Sequelize.INTEGER
      },

      resourceId: {
        allowNull: false,
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
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
    return queryInterface.dropTable('file')
  }
}
