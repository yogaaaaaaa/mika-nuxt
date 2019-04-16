'use strict'

module.exports = (sequelize, DataTypes) => {
  let outletMerchantStaff = sequelize.define('outletMerchantStaff', {
    outletId: DataTypes.INTEGER,
    merchantStaffId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  outletMerchantStaff.associate = (models) => {
    outletMerchantStaff.belongsTo(models.outlet, { foreignKey: 'outletId' })
    outletMerchantStaff.belongsTo(models.merchantStaff, { foreignKey: 'merchantStaffId' })
  }
  return outletMerchantStaff
}
