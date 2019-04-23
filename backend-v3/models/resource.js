'use strict'

module.exports = (sequelize, DataTypes) => {
  let resource = sequelize.define('resource', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
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
