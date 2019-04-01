'use strict'

module.exports = (sequelize, DataTypes) => {
  let apiKey = sequelize.define('apiKey', {
    apiIdKey: DataTypes.STRING,
    apiSecretKey: DataTypes.STRING,
    apiSharedKey: DataTypes.STRING,

    partnerId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  apiKey.associate = function (models) {
    apiKey.belongsTo(models.partner, { foreignKey: 'partnerId' })
  }
  return apiKey
}
