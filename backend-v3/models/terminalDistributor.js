'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminalDistributor = sequelize.define('terminalDistributor', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    address: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNumber: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })
  terminalDistributor.associate = (models) => {
    terminalDistributor.hasMany(models.terminalBatch, { foreignKey: 'terminalDistributorId' })
  }
  return terminalDistributor
}
