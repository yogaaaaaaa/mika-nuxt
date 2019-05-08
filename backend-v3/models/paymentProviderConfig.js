'use strict'

const kv = require('./helpers/kv')

module.exports = (sequelize, DataTypes) => {
  let paymentProviderConfig = sequelize.define('paymentProviderConfig', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    handler: DataTypes.STRING,

    sandbox: DataTypes.BOOLEAN,
    merchantId: DataTypes.INTEGER,

    config: {
      type: DataTypes.VIRTUAL,
      get: kv.selfKvGetter('paymentProviderConfigKvs')
    }
  }, {
    freezeTableName: true,
    paranoid: true
  })

  paymentProviderConfig.addScope('paymentProviderConfigKv', () => ({
    include: [
      sequelize.models.paymentProviderConfigKv.scope('excludeEntity')
    ]
  }))
  paymentProviderConfig.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })

  paymentProviderConfig.prototype.loadConfigKv = kv.selfKvLoad('paymentProviderConfigKvs')

  paymentProviderConfig.associate = (models) => {
    paymentProviderConfig.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    paymentProviderConfig.hasMany(models.paymentProvider, { foreignKey: 'paymentProviderConfigId' })
    paymentProviderConfig.hasMany(models.paymentProviderConfigKv, { foreignKey: 'paymentProviderConfigId' })
  }

  return paymentProviderConfig
}
