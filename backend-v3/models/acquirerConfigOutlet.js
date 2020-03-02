'use strict'

module.exports = (sequelize, DataTypes) => {
  const acquirerConfigOutlet = sequelize.define('acquirerConfigOutlet', {
    acquirerConfigId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER,

    config: DataTypes.JSONB
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirerConfigOutlet.associate = (models) => {
    acquirerConfigOutlet.belongsTo(models.acquirerConfig, { foreignKey: 'acquirerConfigId' })
    acquirerConfigOutlet.belongsTo(models.outlet, { foreignKey: 'outletId' })
  }

  acquirerConfigOutlet.addScope('excludeConfig', {
    attributes: {
      exclude: [
        'config'
      ]
    }
  })
  acquirerConfigOutlet.addScope('admin', () => ({
    paranoid: false,
    include: [
      {
        model: sequelize.models.acquirerConfig,
        paranoid: false
      },
      {
        model: sequelize.models.outlet,
        paranoid: false
      }
    ]
  }))

  return acquirerConfigOutlet
}
