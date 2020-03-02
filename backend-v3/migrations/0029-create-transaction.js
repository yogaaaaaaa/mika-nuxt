'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('transaction', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING(27)
        },

        idAlias: {
          unique: true,
          type: Sequelize.STRING(40)
        },

        amount: {
          allowNull: false,
          type: Sequelize.DECIMAL(28, 2)
        },

        status: {
          allowNull: false,
          type: Sequelize.STRING(32)
        },

        token: {
          type: Sequelize.STRING(1024)
        },
        tokenType: {
          type: Sequelize.STRING
        },

        userToken: {
          type: Sequelize.STRING(1024)
        },
        userTokenType: {
          type: Sequelize.STRING
        },

        reference: {
          type: Sequelize.STRING
        },
        referenceName: {
          type: Sequelize.STRING
        },

        customerReference: {
          type: Sequelize.STRING
        },
        customerReferenceName: {
          type: Sequelize.STRING
        },

        authorizationReference: {
          type: Sequelize.STRING
        },
        authorizationReferenceName: {
          type: Sequelize.STRING
        },

        traceNumber: {
          type: Sequelize.INTEGER
        },

        acquirerUtcOffset: {
          type: Sequelize.STRING
        },
        acquirerTimeAt: {
          type: Sequelize.DATE
        },

        voidReference: {
          type: Sequelize.STRING
        },
        voidReferenceName: {
          type: Sequelize.STRING
        },

        voidAuthorizationReference: {
          type: Sequelize.STRING
        },
        voidAuthorizationReferenceName: {
          type: Sequelize.STRING
        },

        voidTraceNumber: {
          type: Sequelize.INTEGER
        },

        voidAcquirerTimeAt: {
          type: Sequelize.DATE
        },

        agentOrderReference: {
          type: Sequelize.STRING
        },

        processFee: {
          type: Sequelize.DECIMAL(28, 2)
        },
        shareAcquirer: {
          type: Sequelize.DECIMAL(5, 4)
        },
        shareMerchant: {
          type: Sequelize.DECIMAL(5, 4)
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

        description: {
          type: Sequelize.STRING
        },
        voidReason: {
          type: Sequelize.STRING
        },

        references: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },
        properties: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },
        encryptedProperties: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },

        settleBatchInId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'settleBatchIn',
            key: 'id'
          }
        },
        settleBatchId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'settleBatch',
            key: 'id'
          }
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
        },
        acquirerConfigAgentId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerConfigAgent',
            key: 'id'
          }
        },
        acquirerConfigOutletId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerConfigOutlet',
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
      }, { transaction: t })
      await queryInterface.addIndex('transaction', ['status'], { transaction: t })
      await queryInterface.addIndex('transaction', ['createdAt'], { transaction: t })
      await queryInterface.addIndex('transaction', ['updatedAt'], { transaction: t })
      await queryInterface.addIndex('transaction', ['agentOrderReference', 'agentId'], { unique: true, transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transaction')
  }
}
