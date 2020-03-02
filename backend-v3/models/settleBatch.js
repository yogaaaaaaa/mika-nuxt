'use strict'

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Sequelize.Op
  const settleBatch = sequelize.define('settleBatch', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    status: DataTypes.STRING,

    batchNumber: DataTypes.INTEGER,
    traceNumber: DataTypes.INTEGER,

    amountSettle: DataTypes.DECIMAL(28, 2),
    transactionSettleCount: DataTypes.INTEGER,

    properties: DataTypes.JSONB,

    acquirerUtcOffset: DataTypes.STRING,
    acquirerTimeAt: DataTypes.DATE,

    acquirerConfigId: DataTypes.INTEGER,
    agentId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  settleBatch.associate = (models) => {
    settleBatch.belongsTo(models.acquirerConfig, { foreignKey: 'acquirerConfigId' })

    settleBatch.belongsTo(models.acquirerConfigAgent, {
      foreignKey: 'acquirerConfigId',
      targetKey: 'acquirerConfigId',
      scope: {
        agentId: {
          [Op.eq]: sequelize.col('settleBatch.agentId')
        }
      }
    })
    settleBatch.belongsTo(models.acquirerConfigOutlet, {
      foreignKey: 'acquirerConfigId',
      targetKey: 'acquirerConfigId',
      scope: {
        outletId: {
          [Op.eq]: sequelize.col('settleBatch.outletId')
        }
      }
    })

    settleBatch.belongsTo(models.agent, { foreignKey: 'agentId' })
    settleBatch.belongsTo(models.outlet, { foreignKey: 'outletId' })
    settleBatch.belongsTo(models.merchant, { foreignKey: 'merchantId' })
  }

  settleBatch.addScope('admin', () => ({
    paranoid: false,
    include: [
      {
        model: sequelize.models.acquirerConfig.scope('excludeConfig'),
        paranoid: false
      },
      {
        model: sequelize.models.agent.scope('id', 'name'),
        paranoid: false
      },
      {
        model: sequelize.models.outlet.scope('id', 'name'),
        paranoid: false
      },
      {
        model: sequelize.models.merchant.scope('id', 'name'),
        paranoid: false
      },
      {
        model: sequelize.models.acquirerConfigAgent.scope('excludeConfig'),
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerTerminal.scope('excludeConfig'),
            paranoid: false,
            include: [
              {
                model: sequelize.models.acquirerTerminalCommon.scope('excludeConfig'),
                paranoid: false,
                include: [
                  {
                    model: sequelize.models.acquirerCompany,
                    paranoid: false
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }))

  settleBatch.addScope('agent', (agentId) => ({
    where: agentId ? { agentId } : {},
    paranoid: false,
    include: [
      {
        model: sequelize.models.acquirerConfig.scope('excludeConfig'),
        paranoid: false
      },
      {
        model: sequelize.models.acquirerConfigAgent.scope('excludeConfig'),
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerTerminal.scope('excludeConfig'),
            paranoid: false,
            include: [
              {
                model: sequelize.models.acquirerTerminalCommon.scope('excludeConfig'),
                paranoid: false,
                include: [
                  {
                    model: sequelize.models.acquirerCompany,
                    paranoid: false
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }))

  return settleBatch
}
