'use strict'

module.exports = (sequelize, DataTypes) => {
  const terminalModel = sequelize.define('terminalModel', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    manufacturer: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  terminalModel.associate = (models) => {
    terminalModel.hasMany(models.terminal, { foreignKey: 'terminalModelId' })
    terminalModel.hasMany(models.terminalProcurement, { foreignKey: 'terminalModelId' })
  }

  terminalModel.addScope('admin', {
    paranoid: false
  })

  return terminalModel
}
