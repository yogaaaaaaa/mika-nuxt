'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('merchant', {
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
      shortName: {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING(25)
      },
      description: {
        type: Sequelize.STRING
      },

      status: { // NOTE: Optional for now
        type: Sequelize.STRING(32)
      },

      companyForm: {
        type: Sequelize.STRING
      },

      email: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
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

      taxCardNumber: {
        type: Sequelize.STRING
      },
      scannedTaxCardResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      bankName: {
        type: Sequelize.STRING
      },
      bankBranchName: {
        type: Sequelize.STRING
      },
      bankAccountName: {
        type: Sequelize.STRING
      },
      bankAccountNumber: {
        type: Sequelize.STRING
      },

      scannedBankStatementResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      scannedSkmenkumhamResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      scannedSiupResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      scannedTdpResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      scannedSkdpResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },

      ownerName: {
        type: Sequelize.STRING
      },
      ownerOccupation: {
        type: Sequelize.STRING
      },
      ownerEmail: {
        type: Sequelize.STRING
      },
      ownerPhoneNumber: {
        type: Sequelize.STRING
      },
      ownerIdCardNumber: {
        type: Sequelize.STRING
      },
      ownerIdCardType: {
        type: Sequelize.STRING
      },
      ownerTaxCardNumber: {
        type: Sequelize.STRING
      },
      ownerScannedIdCardResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
          key: 'id'
        }
      },
      ownerScannedTaxCardResourceId: {
        type: Sequelize.STRING(27),
        references: {
          model: 'resource',
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
    return queryInterface.dropTable('merchant')
  }
}
