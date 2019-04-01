'use strict'

module.exports = (sequelize, DataTypes) => {
  let agentViewGroup = sequelize.define('agentViewGroup', {
    agentId: DataTypes.INTEGER,
    viewGroupId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  agentViewGroup.associate = (models) => {
    agentViewGroup.belongsTo(models.agent, { foreignKey: 'agentId' })
    agentViewGroup.belongsTo(models.viewGroup, { foreignKey: 'viewGroupId' })
  }
  return agentViewGroup
}
