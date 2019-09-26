'use strict'

const kv = require('./helpers/kv')

module.exports = (sequelize, DataTypes) => {
  const acquirerConfigKv = sequelize.define('acquirerConfigKv', {
    acquirerConfigId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    timestamps: false,
    freezeTableName: true,
    paranoid: false
  })

  acquirerConfigKv.addScope('excludeEntity', {
    attributes: { exclude: ['acquirerConfigId'] }
  })

  acquirerConfigKv.setKv = kv.setKvMethod('acquirerConfigId')
  acquirerConfigKv.getKv = kv.getKvMethod('acquirerConfigId')

  acquirerConfigKv.associate = (models) => {}

  return acquirerConfigKv
}
