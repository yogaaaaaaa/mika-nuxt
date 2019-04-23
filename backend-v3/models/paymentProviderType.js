'use strict'

module.exports = (sequelize, DataTypes) => {
  var paymentProviderType = sequelize.define('paymentProviderType', {
    class: DataTypes.STRING,

    name: DataTypes.STRING,
    description: DataTypes.STRING,

    thumbnail: DataTypes.STRING,
    thumbnailGray: DataTypes.STRING,
    chartColor: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })

  paymentProviderType.associate = (models) => {
    paymentProviderType.hasMany(models.paymentProvider, { foreignKey: 'paymentProviderTypeId' })
  }

  return paymentProviderType
}
