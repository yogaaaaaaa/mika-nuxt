'use strict'

module.exports = (sequelize, DataTypes) => {
  let agentAcquirerExclusion = sequelize.define('agentAcquirerExclusion', {
    agentId: DataTypes.INTEGER,
    acquirerId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  agentAcquirerExclusion.associate = (models) => {
    agentAcquirerExclusion.belongsTo(models.agent, { foreignKey: 'agentId' })
    agentAcquirerExclusion.belongsTo(models.acquirer, { foreignKey: 'acquirerId' })
  }

  return agentAcquirerExclusion
}
