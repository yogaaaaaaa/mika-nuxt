'use strict'

module.exports = (sequelize, DataTypes) => {
  let agentTerminal = sequelize.define('agentTerminal', {
    agentId: DataTypes.INTEGER,
    terminalId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  agentTerminal.associate = (models) => {
    agentTerminal.belongsTo(models.agent, { foreignKey: 'agentId' })
    agentTerminal.belongsTo(models.terminal, { foreignKey: 'terminalId' })
  }
  return agentTerminal
}
