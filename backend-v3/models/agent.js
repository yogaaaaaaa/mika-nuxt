'use strict'

module.exports = (sequelize, DataTypes) => {
  let agent = sequelize.define('agent', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    generalLocationLong: DataTypes.STRING,
    generalLocationLat: DataTypes.STRING,
    generalLocationRadiusMeter: DataTypes.FLOAT,

    boundedToTerminal: DataTypes.BOOLEAN,

    userId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  agent.associate = (models) => {
    agent.belongsTo(models.user, { foreignKey: 'userId' })
    agent.belongsTo(models.outlet, { foreignKey: 'outletId' })
    agent.belongsTo(models.merchant, { foreignKey: 'merchantId' })

    agent.hasMany(models.transaction, { foreignKey: 'agentId' })

    // agent.hasMany(models.agentPaymentProvider, { foreignKey: 'agentId' })
    agent.belongsToMany(
      models.paymentProvider,
      {
        through: 'agentPaymentProvider',
        foreignKey: 'agentId',
        otherKey: 'paymentProviderId'
      }
    )
  }
  return agent
}
