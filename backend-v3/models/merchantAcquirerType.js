'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantAcquirerType = sequelize.define('merchantAcquirerType', {
    merchantId: DataTypes.INTEGER,
    acquirerTypeId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  merchantAcquirerType.associate = (models) => {
    merchantAcquirerType.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    merchantAcquirerType.belongsTo(models.acquirerType, { foreignKey: 'acquirerTypeId' })
  }

  return merchantAcquirerType
}
