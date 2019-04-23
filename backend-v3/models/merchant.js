'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchant = sequelize.define('merchant', {
    idAlias: DataTypes.CHAR(40),

    name: DataTypes.STRING,
    shortName: DataTypes.CHAR(25),
    description: DataTypes.STRING,

    status: DataTypes.CHAR(32),

    companyForm: DataTypes.STRING,

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
    scannedTaxCardResourceId: DataTypes.CHAR(27),

    bankName: DataTypes.STRING,
    bankBranchName: DataTypes.STRING,
    bankAccountName: DataTypes.STRING,
    bankAccountNumber: DataTypes.STRING,

    scannedBankStatementResourceId: DataTypes.CHAR(27),
    scannedSkmenkumhamResourceId: DataTypes.CHAR(27),
    scannedSiupResourceId: DataTypes.CHAR(27),
    scannedTdpResourceId: DataTypes.CHAR(27),
    scannedSkdpResourceId: DataTypes.CHAR(27),

    ownerName: DataTypes.STRING,
    ownerOccupation: DataTypes.STRING,
    ownerEmail: DataTypes.STRING,
    ownerPhoneNumber: DataTypes.STRING,
    ownerIdCardNumber: DataTypes.STRING,
    ownerIdCardType: DataTypes.STRING,
    ownerTaxCardNumber: DataTypes.STRING,

    ownerScannedIdCardResourceId: DataTypes.CHAR(27),
    ownerScannedTaxCardResourceId: DataTypes.CHAR(27),

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

    merchant.belongsTo(models.partner, { foreignKey: 'partnerId' })

    merchant.belongsToMany(
      models.paymentProviderType,
      {
        through: 'merchantPaymentProviderType',
        foreignKey: 'merchantId',
        otherKey: 'paymentProviderTypeId'
      }
    )

    merchant.addScope('excludeScanned', {
      attributes: { exclude: [
        'idTaxCard',
        'scannedTaxCardResourceId',
        'scannedBankStatementResourceId',
        'scannedSkmenkumhamResourceId',
        'scannedSiupResourceId',
        'scannedTdpResourceId',
        'scannedSkdpResourceId',
        'ownerScannedIdCardResourceId',
        'ownerScannedTaxCardResourceId'
      ] }
    })
    merchant.addScope('excludeBankInfo', {
      attributes: { exclude: [
        'bankName',
        'bankBranchName',
        'bankAccountName',
        'bankAccountNumber'
      ] }
    })
  }
  return merchant
}
