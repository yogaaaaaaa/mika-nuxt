'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantStaffOutlet = sequelize.define('merchantStaffOutlet', {
    merchantStaffId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  merchantStaffOutlet.associate = (models) => {
    merchantStaffOutlet.belongsTo(models.outlet, { foreignKey: 'outletId' })
    merchantStaffOutlet.belongsTo(models.merchantStaff, { foreignKey: 'merchantStaffId' })
  }

  return merchantStaffOutlet
}
