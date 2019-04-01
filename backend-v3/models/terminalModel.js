'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminalModel = sequelize.define('terminalModel', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    manufacturer: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })
  terminalModel.associate = (models) => {
    terminalModel.hasMany(models.terminal, { foreignKey: 'terminalModelId' })
  }
  return terminalModel
}
