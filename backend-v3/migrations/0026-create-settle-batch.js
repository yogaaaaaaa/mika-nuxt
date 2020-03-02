'use strict'

const { templateTags } = require('libs/string')
const normalizeSpace = templateTags.normalizeSpace

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('settleBatch', {
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

        status: {
          allowNull: false,
          type: Sequelize.STRING
        },

        batchNumber: {
          type: Sequelize.INTEGER
        },
        traceNumber: {
          type: Sequelize.INTEGER
        },

        amountSettle: {
          type: Sequelize.DECIMAL(28, 2)
        },
        transactionSettleCount: {
          type: Sequelize.INTEGER
        },

        properties: {
          allowNull: false,
          defaultValue: {},
          type: Sequelize.JSONB
        },

        acquirerUtcOffset: {
          type: Sequelize.STRING
        },
        acquirerTimeAt: {
          type: Sequelize.DATE
        },

        acquirerConfigId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acquirerConfig',
            key: 'id'
          }
        },
        agentId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'agent',
            key: 'id'
          }
        },
        outletId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'outlet',
            key: 'id'
          }
        },
        merchantId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'merchant',
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
      await queryInterface.addConstraint('settleBatch', ['agentId', 'outletId', 'merchantId'], {
        type: 'check',
        where: queryInterface.sequelize.literal(
          normalizeSpace`
          ( 
            CASE WHEN "agentId" IS NULL THEN 0 ELSE 1 END
            + CASE WHEN "outletId" IS NULL THEN 0 ELSE 1 END
            + CASE WHEN "merchantId" IS NULL THEN 0 ELSE 1 END
          ) = 1
          `
        ),
        transaction: t
      })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('settleBatch')
  }
}
