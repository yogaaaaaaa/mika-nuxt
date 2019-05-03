'use strict'

module.exports = (sequelize, DataTypes) => {
  let paymentProviderConfigKv = sequelize.define('paymentProviderConfigKv', {
    paymentProviderConfigId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: false
  })

  paymentProviderConfigKv.associate = (models) => {}

  return paymentProviderConfigKv
}
