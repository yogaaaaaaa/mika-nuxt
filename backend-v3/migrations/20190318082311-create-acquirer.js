'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('acquirer', {
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

      minimumAmount: {
        type: Sequelize.INTEGER
      },
      maximumAmount: {
        type: Sequelize.INTEGER
      },

      shareAcquirer: {
        type: Sequelize.FLOAT
      },
      shareMerchant: {
        type: Sequelize.FLOAT
      },
      shareMerchantWithPartner: {
        type: Sequelize.FLOAT
      },
      sharePartner: {
        type: Sequelize.FLOAT
      },

      directSettlement: {
        type: Sequelize.BOOLEAN
      },

      gateway: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      hidden: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },

      merchantId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'merchant',
          key: 'id'
        }
      },
      acquirerConfigId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'acquirerConfig',
          key: 'id'
        }
      },
      acquirerTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'acquirerType',
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
    return queryInterface.dropTable('acquirer')
  }
}
