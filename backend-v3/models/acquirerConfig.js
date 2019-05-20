'use strict'

const kv = require('./helpers/kv')

module.exports = (sequelize, DataTypes) => {
  let acquirerConfig = sequelize.define('acquirerConfig', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    handler: DataTypes.STRING,

    sandbox: DataTypes.BOOLEAN,
    merchantId: DataTypes.INTEGER,

    config: {
      type: DataTypes.VIRTUAL,
      get: kv.selfKvGetter('acquirerConfigKvs')
    }
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: true
  })

  acquirerConfig.addScope('acquirerConfigKv', () => ({
    include: [
      {
        model: sequelize.models.acquirerConfigKv.scope('excludeEntity')
      }
    ]
  }))
  acquirerConfig.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })

  acquirerConfig.prototype.loadConfigKv = kv.selfKvLoad('acquirerConfigKvs')

  acquirerConfig.associate = (models) => {
    acquirerConfig.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    acquirerConfig.hasMany(models.acquirer, { foreignKey: 'acquirerConfigId' })
    acquirerConfig.hasMany(models.acquirerConfigKv, { foreignKey: 'acquirerConfigId' })
  }

  return acquirerConfig
}
