'use strict'

module.exports = (sequelize, DataTypes) => {
  let cipherboxKey = sequelize.define('cipherboxKey', {
    idKey: DataTypes.STRING,
    keys: DataTypes.TEXT,

    terminalId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  cipherboxKey.associate = function (models) {
    cipherboxKey.belongsTo(models.terminal, { foreignKey: 'terminalId' })
  }
  return cipherboxKey
}
