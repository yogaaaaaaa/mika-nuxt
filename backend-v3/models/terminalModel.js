'use strict'

module.exports = (sequelize, DataTypes) => {
  let terminalModel = sequelize.define('terminalModel', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    manufacturer: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: true
  })

  terminalModel.associate = (models) => {
    terminalModel.hasMany(models.terminal, { foreignKey: 'terminalModelId' })
    terminalModel.hasMany(models.terminalProcurement, { foreignKey: 'terminalModelId' })
  }

  return terminalModel
}
