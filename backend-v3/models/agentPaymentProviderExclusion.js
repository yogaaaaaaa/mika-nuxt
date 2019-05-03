'use strict'

module.exports = (sequelize, DataTypes) => {
  let agentPaymentProviderExclusion = sequelize.define('agentPaymentProviderExclusion', {
    agentId: DataTypes.INTEGER,
    paymentProviderId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  agentPaymentProviderExclusion.associate = (models) => {
    agentPaymentProviderExclusion.belongsTo(models.agent, { foreignKey: 'agentId' })
    agentPaymentProviderExclusion.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })
  }

  return agentPaymentProviderExclusion
}
