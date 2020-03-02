'use strict'

const counter = require('./helpers/counter')

module.exports = (sequelize, DataTypes) => {
  const acquirerConfigAgent = sequelize.define('acquirerConfigAgent', {
    acquirerConfigId: DataTypes.INTEGER,
    agentId: DataTypes.INTEGER,
    acquirerTerminalId: DataTypes.INTEGER,
    latestSettleBatchId: DataTypes.INTEGER,

    batchNumberCounter: DataTypes.INTEGER,

    config: DataTypes.JSONB
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirerConfigAgent.associate = (models) => {
    acquirerConfigAgent.belongsTo(models.acquirerConfig, { foreignKey: 'acquirerConfigId' })
    acquirerConfigAgent.belongsTo(models.agent, { foreignKey: 'agentId' })
    acquirerConfigAgent.belongsTo(models.acquirerTerminal, { foreignKey: 'acquirerTerminalId' })
    acquirerConfigAgent.belongsTo(models.settleBatch, { foreignKey: 'latestSettleBatchId' })
  }

  acquirerConfigAgent.prototype.incrementBatchCounter = counter.generateCounterFunction({
    attribute: 'batchNumberCounter'
  })

  acquirerConfigAgent.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })
  acquirerConfigAgent.addScope('admin', () => ({
    paranoid: false,
    include: [
      {
        model: sequelize.models.acquirerConfig,
        paranoid: false
      },
      {
        model: sequelize.models.agent,
        paranoid: false
      },
      {
        model: sequelize.models.acquirerTerminal,
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerTerminalCommon,
            paranoid: false
          }
        ]
      }
    ]
  }))

  return acquirerConfigAgent
}
