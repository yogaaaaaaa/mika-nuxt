'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantPic = sequelize.define('merchantPic', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    idCardNumber: DataTypes.STRING,
    idCardType: DataTypes.STRING,
    email: DataTypes.STRING,
    occupation: DataTypes.STRING,

    locationLong: DataTypes.STRING,
    locationLat: DataTypes.STRING,
    streetAddress: DataTypes.STRING,
    locality: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,

    userId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  merchantPic.associate = function (models) {
    merchantPic.belongsTo(models.user, { foreignKey: 'userId' })
    merchantPic.belongsTo(models.merchant, { foreignKey: 'merchantId' })
  }
  return merchantPic
}
