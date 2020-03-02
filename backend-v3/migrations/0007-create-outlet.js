'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('outlet', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      idAlias: {
        unique: true,
        type: Sequelize.STRING(25)
      },

      name: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },

      status: { // NOTE: Optional for now
        type: Sequelize.STRING(32)
      },

      email: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },

      locationLong: {
        type: Sequelize.DECIMAL(12, 8)
      },
      locationLat: {
        type: Sequelize.DECIMAL(12, 8)
      },

      streetAddress: {
        type: Sequelize.STRING
      },
      locality: {
        type: Sequelize.STRING
      },
      district: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      postalCode: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },

      ownershipType: {
        type: Sequelize.STRING
      },
      rentStartDate: {
        type: Sequelize.DATE
      },
      rentDurationMonth: {
        type: Sequelize.INTEGER
      },

      otherPaymentSystems: {
        type: Sequelize.STRING
      },

      outletPhotoResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      cashierDeskPhotoResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },

      businessType: {
        type: Sequelize.STRING
      },
      businessDurationMonth: {
        type: Sequelize.INTEGER
      },
      businessMonthlyTurnover: {
        type: Sequelize.INTEGER
      },

      merchantId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'merchant',
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
    return queryInterface.dropTable('outlet')
  }
}
