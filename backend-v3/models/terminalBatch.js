'use strict'

module.exports = (sequelize, DataTypes) => {
  const terminalBatch = sequelize.define('terminalBatch', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    batchStatus: DataTypes.STRING,
    arrivedAt: DataTypes.DATE
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
