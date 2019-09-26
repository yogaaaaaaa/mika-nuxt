'use strict'

const kv = require('./helpers/kv')

module.exports = (sequelize, DataTypes) => {
  const transactionExtraKv = sequelize.define('transactionExtraKv', {
    transactionId: DataTypes.CHAR(27),
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    timestamps: false,
    freezeTableName: true,
    paranoid: false
  })

  transactionExtraKv.addScope('excludeEntity', {
    attributes: { exclude: ['transactionId'] }
  })

  transactionExtraKv.setKv = kv.setKvMethod('transactionId')
  transactionExtraKv.getKv = kv.getKvMethod('transactionId')

  transactionExtraKv.associate = (models) => {}

  return transactionExtraKv
}
