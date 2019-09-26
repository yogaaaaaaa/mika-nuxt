'use strict'

const uid = require('../libs/uid')

module.exports = (sequelize, DataTypes) => {
  const resource = sequelize.define('resource', {
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

  resource.buildWithId = (value = {}, options = {}) => {
    value.id = uid.ksuid.randomSync().string
    return resource.build(value, options)
  }

  resource.associate = (models) => {
    resource.hasMany(models.file, { foreignKey: 'resourceId' })
  }

  return resource
}
