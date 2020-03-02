'use strict'

module.exports = (sequelize, DataTypes) => {
  const settleBatchIn = sequelize.define('settleBatchIn', {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  settleBatchIn.associate = (models) => {
  }

  settleBatchIn.addScope('admin', {
    paranoid: false
  })

  return settleBatchIn
}
