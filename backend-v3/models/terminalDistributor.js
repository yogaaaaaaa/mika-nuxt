'use strict'

module.exports = (sequelize, DataTypes) => {
  const terminalDistributor = sequelize.define('terminalDistributor', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    address: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNumber: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  terminalDistributor.associate = (models) => {
    terminalDistributor.hasMany(models.terminalProcurement, { foreignKey: 'terminalDistributorId' })
  }

  return terminalDistributor
}
