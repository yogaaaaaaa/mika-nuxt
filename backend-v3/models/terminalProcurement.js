'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminalProcurement = sequelize.define('terminalProcurement', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    procurementStatus: DataTypes.STRING,

    terminalModelId: DataTypes.INTEGER,
    terminalCount: DataTypes.INTEGER,

    terminalDistributorId: DataTypes.INTEGER,
    terminalBatchId: DataTypes.INTEGER,
    adminId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  terminalProcurement.associate = (models) => {
    terminalProcurement.belongsTo(models.terminalModel, { foreignKey: 'terminalModelId' })
    terminalProcurement.belongsTo(models.terminalDistributor, { foreignKey: 'terminalDistributorId' })
    terminalProcurement.belongsTo(models.terminalBatch, { foreignKey: 'terminalBatchId' })
    terminalProcurement.belongsTo(models.admin, { foreignKey: 'adminId' })
  }
  return terminalProcurement
}
