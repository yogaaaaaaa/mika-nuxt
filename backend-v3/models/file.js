'use strict'

module.exports = (sequelize, DataTypes) => {
  let file = sequelize.define('file', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    originalFilename: DataTypes.STRING,
    hash: DataTypes.STRING,

    mime: DataTypes.STRING,
    size: DataTypes.INTEGER,

    resourceId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  file.associate = (models) => {
    file.belongsTo(models.resource, { foreignKey: 'resourceId' })
  }
  return file
}