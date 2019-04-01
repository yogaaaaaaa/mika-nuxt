'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchant = sequelize.define('merchant', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    companyForm: DataTypes.STRING,

    locationLong: DataTypes.STRING,
    locationLat: DataTypes.STRING,

    email: DataTypes.STRING,
    website: DataTypes.STRING,
    streetAddress: DataTypes.STRING,
    locality: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,

    idTaxCard: DataTypes.STRING,
    scannedTaxCardResourceId: DataTypes.INTEGER,

    bankName: DataTypes.STRING,
    bankBranchName: DataTypes.STRING,
    bankAccountName: DataTypes.STRING,
    bankAccountNumber: DataTypes.STRING,

    scannedBankStatementResourceId: DataTypes.INTEGER,
    scannedSkmenkumhamResourceId: DataTypes.INTEGER,
    scannedSiupResourceId: DataTypes.INTEGER,
    scannedTdpResourceId: DataTypes.INTEGER,
    scannedSkdpResourceId: DataTypes.INTEGER,

    ownerName: DataTypes.STRING,
    ownerOccupation: DataTypes.STRING,
    ownerEmail: DataTypes.STRING,
    ownerPhoneNumber: DataTypes.STRING,
    ownerIdCardNumber: DataTypes.STRING,
    ownerIdCardType: DataTypes.STRING,
    ownerTaxCardNumber: DataTypes.STRING,

    ownerScannedIdCardResourceId: DataTypes.INTEGER,
    ownerScannedTaxCardResourceId: DataTypes.INTEGER,

    userId: DataTypes.INTEGER,
    partnerId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  merchant.associate = (models) => {
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedTaxCardResourceId',
      as: 'scannedTaxCardResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedBankStatementResourceId',
      as: 'scannedBankStatementResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedSkmenkumhamResourceId',
      as: 'scannedSkmenkumhamResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedSiupResourceId',
      as: 'scannedSiupResource' }
    )
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedTdpResourceId',
      as: 'scannedTdpResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedSkdpResourceId',
      as: 'scannedSkdpResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'ownerScannedIdCardResourceId',
      as: 'ownerScannedIdCardResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'ownerScannedTaxCardResourceId',
      as: 'ownerScannedTaxCardResource' }
    )

    merchant.belongsTo(models.user, { foreignKey: 'userId' })
    merchant.belongsTo(models.partner, { foreignKey: 'partnerId' })

    merchant.belongsToMany(
      models.paymentProviderType,
      {
        through: 'merchantPaymentProviderType',
        foreignKey: 'merchantId',
        otherKey: 'paymentProviderTypeId'
      }
    )
  }
  return merchant
}
