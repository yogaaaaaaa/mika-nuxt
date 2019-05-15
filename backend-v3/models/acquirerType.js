'use strict'

module.exports = (sequelize, DataTypes) => {
  let acquirerType = sequelize.define('acquirerType', {
    class: DataTypes.STRING,

    name: DataTypes.STRING,
    description: DataTypes.STRING,

    thumbnail: DataTypes.STRING,
    thumbnailGray: DataTypes.STRING,
    chartColor: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })

  acquirerType.associate = (models) => {
    acquirerType.hasMany(models.acquirer, { foreignKey: 'acquirerTypeId' })
  }

  return acquirerType
}
