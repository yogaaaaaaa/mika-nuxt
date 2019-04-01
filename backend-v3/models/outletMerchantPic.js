'use strict'

module.exports = (sequelize, DataTypes) => {
  let outletMerchantPic = sequelize.define('outletMerchantPic', {
    outletId: DataTypes.INTEGER,
    merchantPicId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  outletMerchantPic.associate = (models) => {
    outletMerchantPic.belongsTo(models.outlet, { foreignKey: 'outletId' })
    outletMerchantPic.belongsTo(models.merchantPic, { foreignKey: 'merchantPicId' })
  }
  return outletMerchantPic
}
