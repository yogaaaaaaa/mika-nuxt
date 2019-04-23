'use strict'

module.exports = (sequelize, DataTypes) => {
  let apiKey = sequelize.define('apiKey', {
    idKey: DataTypes.STRING,
    secretKey: DataTypes.STRING,
    sharedKey: DataTypes.STRING,

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
