'use strict'

module.exports = (sequelize, DataTypes) => {
  const acquirerConfig = sequelize.define('acquirerConfig', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    handler: DataTypes.STRING,

    sandbox: DataTypes.BOOLEAN,
    merchantId: DataTypes.INTEGER,

    config: DataTypes.JSONB
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirerConfig.associate = (models) => {
    acquirerConfig.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    acquirerConfig.hasMany(models.acquirerConfigAgent, { foreignKey: 'acquirerConfigId' })
    acquirerConfig.hasMany(models.acquirerConfigOutlet, { foreignKey: 'acquirerConfigId' })
  }

  acquirerConfig.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })
  acquirerConfig.addScope('admin', () => ({
    paranoid: false
  }))

  return acquirerConfig
}
