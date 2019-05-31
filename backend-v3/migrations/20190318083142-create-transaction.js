'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transaction', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.CHAR(27, true)
      },

      idAlias: {
        allowNull: false,
        unique: true,
        type: Sequelize.CHAR(40, true)
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
      },

      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(28, 2)
      },

      status: {
        allowNull: false,
        type: Sequelize.CHAR(32)
      },
      settlementStatus: {
        // allowNull: false,
        type: Sequelize.CHAR(32)
      },

      token: {
        type: Sequelize.STRING
      },
      tokenType: {
        type: Sequelize.STRING
      },

      userToken: {
        type: Sequelize.STRING
      },
      userTokenType: {
        type: Sequelize.STRING
      },

      customerReference: {
        type: Sequelize.STRING
      },
      customerReferenceName: {
        type: Sequelize.STRING
      },
      referenceNumber: {
        type: Sequelize.STRING
      },
      referenceNumberName: {
        type: Sequelize.STRING
      },

      cardApprovalCode: {
        type: Sequelize.STRING
      },
      cardNetwork: {
        type: Sequelize.STRING
      },
      cardIssuer: {
        type: Sequelize.STRING
      },
      cardAcquirer: {
        type: Sequelize.STRING
      },
      cardType: {
        type: Sequelize.STRING
      },
      cardPan: {
        type: Sequelize.STRING
      },

      aliasThumbnail: {
        type: Sequelize.STRING
      },
      aliasThumbnailGray: {
        type: Sequelize.STRING
      },

      locationLong: {
        type: Sequelize.DECIMAL(12, 8)
      },
      locationLat: {
        type: Sequelize.DECIMAL(12, 8)
      },
      ipAddress: {
        type: Sequelize.STRING
      },

      voidReason: {
        type: Sequelize.TEXT
      },

      agentId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'agent',
          key: 'id'
        }
      },
      terminalId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'terminal',
          key: 'id'
        }
      },
      acquirerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'acquirer',
          key: 'id'
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transaction')
  }
}
