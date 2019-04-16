'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantStaffViewGroup = sequelize.define('merchantStaffViewGroup', {
    merchantStaffId: DataTypes.INTEGER,
    viewGroupId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  merchantStaffViewGroup.associate = (models) => {
    merchantStaffViewGroup.belongsTo(models.merchantStaff, { foreignKey: 'merchantStaffId' })
    merchantStaffViewGroup.belongsTo(models.viewGroup, { foreignKey: 'viewGroupId' })
  }
  return merchantStaffViewGroup
}
