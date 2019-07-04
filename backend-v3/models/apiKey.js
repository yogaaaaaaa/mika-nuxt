'use strict'

module.exports = (sequelize, DataTypes) => {
  let apiKey = sequelize.define('apiKey', {
    idKey: DataTypes.STRING,
    secretKey: DataTypes.STRING,
    sharedKey: DataTypes.STRING,

    partnerId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  apiKey.associate = function (models) {
    apiKey.belongsTo(models.partner, { foreignKey: 'partnerId' })
  }

  return apiKey
}
