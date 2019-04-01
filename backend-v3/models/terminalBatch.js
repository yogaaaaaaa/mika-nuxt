'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminalBatch = sequelize.define('terminalBatch', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    batchStatus: DataTypes.STRING,
    dateArrived: DataTypes.DATE,

    terminalDistributorId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  terminalBatch.associate = (models) => {
    terminalBatch.belongsTo(models.terminalDistributor, { foreignKey: 'terminalDistributorId' })
    terminalBatch.hasMany(models.terminal, { foreignKey: 'terminalBatchId' })
  }
  return terminalBatch
}
