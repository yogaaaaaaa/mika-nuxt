'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('acquirerTerminalCommon', {
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

      config: {
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSONB
      },

      acquirerCompanyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'acquirerCompany',
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
    return queryInterface.dropTable('acquirerTerminalCommon')
  }
}
