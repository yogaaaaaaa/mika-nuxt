'use strict'

module.exports = (sequelize, DataTypes) => {
  let paymentProvider = sequelize.define('paymentProvider', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    minimumAmount: DataTypes.INTEGER,
    maximumAmount: DataTypes.INTEGER,

    shareMerchant: DataTypes.FLOAT,
    shareMerchantWithPartner: DataTypes.FLOAT,
    sharePartner: DataTypes.FLOAT,

    directSettlement: DataTypes.BOOLEAN,

    gateway: DataTypes.BOOLEAN,
    hidden: DataTypes.BOOLEAN,

    merchantId: DataTypes.INTEGER,
    paymentProviderConfigId: DataTypes.INTEGER,
    paymentProviderTypeId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  paymentProvider.associate = (models) => {
    paymentProvider.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    paymentProvider.belongsTo(models.paymentProviderConfig, { foreignKey: 'paymentProviderConfigId' })
    paymentProvider.belongsTo(models.paymentProviderType, { foreignKey: 'paymentProviderTypeId' })

    paymentProvider.hasMany(models.transaction, { foreignKey: 'paymentProviderId' })

    paymentProvider.addScope('excludeShare', {
      attributes: {
        exclude: [
          'shareMerchant',
          'shareMerchantWithPartner',
          'sharePartner',
          'directSettlement'
        ]
      }
    })

    paymentProvider.addScope('excludeExtra', {
      attributes: {
        exclude: [
          'minimumAmount',
          'maximumAmount',
          'gateway',
          'hidden'
        ]
      }
    })
  }
  return paymentProvider
}
