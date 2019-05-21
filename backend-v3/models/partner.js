'use strict'

module.exports = (sequelize, DataTypes) => {
  let partner = sequelize.define('partner', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    email: DataTypes.STRING,
    website: DataTypes.STRING,
    streetAddress: DataTypes.STRING,
    locality: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,

    bankName: DataTypes.STRING,
    bankBranchName: DataTypes.STRING,
    bankAccountName: DataTypes.STRING,
    bankAccountNumber: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  partner.associate = (models) => {
    partner.hasMany(models.apiKey, { foreignKey: 'partnerId' })
    partner.hasMany(models.merchant, { foreignKey: 'partnerId' })
  }

  return partner
}
