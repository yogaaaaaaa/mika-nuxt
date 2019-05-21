'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantAcquirerType = sequelize.define('merchantAcquirerType', {
    merchantId: DataTypes.INTEGER,
    acquirerTypeId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  merchantAcquirerType.associate = (models) => {
    merchantAcquirerType.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    merchantAcquirerType.belongsTo(models.acquirerType, { foreignKey: 'acquirerTypeId' })
  }

  return merchantAcquirerType
}
