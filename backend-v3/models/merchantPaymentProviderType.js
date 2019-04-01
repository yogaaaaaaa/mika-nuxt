'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantPaymentProviderType = sequelize.define('merchantPaymentProviderType', {
    merchantId: DataTypes.INTEGER,
    paymentProviderTypeId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  merchantPaymentProviderType.associate = (models) => {
    merchantPaymentProviderType.belongsTo(models.merchant, { foreignKey: 'merchantPicId' })
    merchantPaymentProviderType.belongsTo(models.paymentProviderType, { foreignKey: 'paymentProviderTypeId' })
  }
  return merchantPaymentProviderType
}
