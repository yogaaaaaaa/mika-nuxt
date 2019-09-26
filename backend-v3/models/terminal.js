'use strict'

module.exports = (sequelize, DataTypes) => {
  const terminal = sequelize.define('terminal', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    idAlias: DataTypes.CHAR(25),

    serialNumber: DataTypes.STRING,
    imei: DataTypes.STRING,

    status: DataTypes.CHAR(32),

    terminalModelId: DataTypes.INTEGER,
    terminalBatchId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  terminal.associate = (models) => {
    terminal.belongsTo(models.terminalModel, { foreignKey: 'terminalModelId' })
    terminal.belongsTo(models.terminalBatch, { foreignKey: 'terminalBatchId' })
    terminal.belongsTo(models.outlet, { foreignKey: 'outletId' })
    terminal.belongsTo(models.merchant, { foreignKey: 'merchantId' })

    terminal.hasMany(models.cipherboxKey, { foreignKey: 'terminalId' })

    terminal.belongsToMany(
      models.agent,
      {
        through: 'agentTerminal',
        foreignKey: 'terminalId',
        otherKey: 'agentId'
      }
    )

    terminal.addScope('excludeMerchantId', {
      attributes: {
        exclude: [
          'merchantId'
        ]
      }
    })
    terminal.addScope('excludeBatch', {
      attributes: {
        exclude: [
          'terminalBatchId'
        ]
      }
    })
    terminal.addScope('agent', () => ({
      attributes: { exclude: ['archivedAt'] },
      include: [
        models.terminalModel.scope('excludeTimestamp')
      ]
    }))
    terminal.addScope('admin', () => ({
      paranoid: false,
      include: [
        models.terminalModel.scope('paranoid')
      ]
    }))
  }

  return terminal
}
