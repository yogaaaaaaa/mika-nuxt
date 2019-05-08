'use strict'

const kv = require('./helpers/kv')

module.exports = (sequelize, DataTypes) => {
  let paymentProviderConfigKv = sequelize.define('paymentProviderConfigKv', {
    paymentProviderConfigId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    timestamps: false,
    freezeTableName: true,
    paranoid: false
  })

  paymentProviderConfigKv.addScope('excludeEntity', {
    attributes: { exclude: ['paymentProviderConfigId'] }
  })

  paymentProviderConfigKv.setKv = kv.setKvMethod('paymentProviderConfigId')
  paymentProviderConfigKv.getKv = kv.getKvMethod('paymentProviderConfigId')

  paymentProviderConfigKv.associate = (models) => {}

  return paymentProviderConfigKv
}
