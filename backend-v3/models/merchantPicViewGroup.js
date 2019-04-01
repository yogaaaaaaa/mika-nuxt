'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantPicViewGroup = sequelize.define('merchantPicViewGroup', {
    merchantPicId: DataTypes.INTEGER,
    viewGroupId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  merchantPicViewGroup.associate = (models) => {
    merchantPicViewGroup.belongsTo(models.merchantPic, { foreignKey: 'merchantPicId' })
    merchantPicViewGroup.belongsTo(models.viewGroup, { foreignKey: 'viewGroupId' })
  }
  return merchantPicViewGroup
}
