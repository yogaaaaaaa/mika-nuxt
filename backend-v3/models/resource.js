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
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  resource.associate = (models) => {
    resource.hasMany(models.file, { foreignKey: 'resourceId' })
  }

  return resource
}
