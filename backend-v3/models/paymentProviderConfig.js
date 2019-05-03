'use strict'

const _ = require('lodash')

module.exports = (sequelize, DataTypes) => {
  let paymentProviderConfig = sequelize.define('paymentProviderConfig', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    handler: DataTypes.STRING,

    sandbox: DataTypes.BOOLEAN,
    merchantId: DataTypes.INTEGER,

    config: {
      type: DataTypes.VIRTUAL,
      get () {
        let config = {}
        if (Array.isArray(this.paymentProviderConfigKvs)) {
          for (const data of this.paymentProviderConfigKvs) {
            config[data.name] = data.value
          }
          return config
        }
      },
      set (val) {
        if (Array.isArray(this.paymentProviderConfigKvs) && typeof val === 'object') {
          for (const key in val) {
            if (val.hasOwnProperty(key)) {
              let data = _.find(this.paymentProviderConfigKvs, { name: key })
              if (data) {
                if (data.value !== val[key]) data.value = val[key]
              } else {
                this.paymentProviderConfigKvs.push(sequelize.models.paymentProviderConfigKvs.build({
                  paymentProviderConfigId: this.id,
                  name: key,
                  value: val[key]
                }))
              }
            }
          }
        }
      }
    }
  }, {
    freezeTableName: true,
    paranoid: true
  })

  paymentProviderConfig.prototype.saveConfigKv = async function (t) {
    if (Array.isArray(this.paymentProviderConfigKvs)) {
      for (const data of this.paymentProviderConfigKvs) {
        await data.save(t ? { transaction: t } : undefined)
      }
    }
  }

  paymentProviderConfig.associate = (models) => {
    paymentProviderConfig.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    paymentProviderConfig.hasMany(models.paymentProvider, { foreignKey: 'paymentProviderConfigId' })
    paymentProviderConfig.hasMany(models.paymentProviderConfigKv, { foreignKey: 'paymentProviderConfigId' })

    paymentProviderConfig.addScope('excludeConfig', {
      attributes: {
        exclude: [
          'config'
        ]
      }
    })
  }

  return paymentProviderConfig
}
