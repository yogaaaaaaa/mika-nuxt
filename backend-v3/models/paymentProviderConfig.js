'use strict'

module.exports = (sequelize, DataTypes) => {
  let paymentProviderConfig = sequelize.define('paymentProviderConfig', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    providerIdReference: DataTypes.STRING,
    providerIdType: DataTypes.STRING,

    handler: DataTypes.STRING,

    sandboxConfig: DataTypes.BOOLEAN,

    config: {
      type: DataTypes.TEXT,
      get () {
        try {
          return JSON.parse(this.getDataValue('config'))
        } catch (error) {}
      },
      set (value) {
        if (typeof value === 'object') {
          this.setDataValue('config', JSON.stringify(value))
        }
        this.setDataValue('config', null)
      }
    },

    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  paymentProviderConfig.associate = (models) => {
    paymentProviderConfig.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    paymentProviderConfig.hasMany(models.paymentProvider, { foreignKey: 'paymentProviderConfigId' })
  }
  return paymentProviderConfig
}
