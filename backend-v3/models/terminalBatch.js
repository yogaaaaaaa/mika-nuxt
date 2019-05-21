'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminalBatch = sequelize.define('terminalBatch', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    batchStatus: DataTypes.STRING,
    dateArrived: DataTypes.DATE
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  terminalBatch.associate = (models) => {
    terminalBatch.hasMany(models.terminal, { foreignKey: 'terminalBatchId' })
    terminalBatch.hasMany(models.terminalProcurement, { foreignKey: 'terminalBatchId' })
  }

  return terminalBatch
}
