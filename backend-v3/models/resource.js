'use strict'

const uid = require('../libs/uid')

module.exports = (sequelize, DataTypes) => {
  let resource = sequelize.define('resource', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27),
      defaultValue: uid.ksuid.randomSync().string
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  resource.beforeCreate((newResource, options) => {
    newResource.id = uid.ksuid.randomSync().string
  })

  resource.associate = (models) => {
    resource.hasMany(models.file, { foreignKey: 'resourceId' })
  }

  return resource
}
