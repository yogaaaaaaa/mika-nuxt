'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminal = sequelize.define('terminal', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    idAlias: DataTypes.CHAR(40),

    serialNumber: DataTypes.STRING,
    imei: DataTypes.STRING,

    terminalStatus: DataTypes.STRING,

    terminalModelId: DataTypes.INTEGER,
    terminalBatchId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  terminal.associate = (models) => {
    terminal.belongsTo(models.terminalModel, { foreignKey: 'terminalModelId' })
    terminal.belongsTo(models.terminalBatch, { foreignKey: 'terminalBatchId' })
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
  }
  return terminal
}
