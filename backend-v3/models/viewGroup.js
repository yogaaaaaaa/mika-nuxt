'use strict'

module.exports = (sequelize, DataTypes) => {
  let viewGroup = sequelize.define('viewGroup', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    slug: DataTypes.STRING,

    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  viewGroup.associate = (models) => {
    viewGroup.belongsTo(models.merchant, { foreignKey: 'merchantId' })

    viewGroup.belongsToMany(
      models.agent,
      {
        through: 'agentViewGroup',
        foreignKey: 'viewGroupId',
        otherKey: 'agentId'
      }
    )
  }
  return viewGroup
}
