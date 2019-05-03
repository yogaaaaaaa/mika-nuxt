'use strict'

module.exports = (sequelize, DataTypes) => {
  let transactionExtraKv = sequelize.define('transactionExtraKv', {
    transactionId: DataTypes.CHAR(27),
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: false
  })

  transactionExtraKv.associate = (models) => {}

  return transactionExtraKv
}
