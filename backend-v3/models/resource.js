'use strict'

module.exports = (sequelize, DataTypes) => {
  let resource = sequelize.define('resource', {
    id: {
      type: DataTypes.STRING(40),
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })
  resource.associate = (models) => {
    resource.hasMany(models.file, { foreignKey: 'resourceId' })
  }
  return resource
}
