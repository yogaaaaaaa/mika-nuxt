'use strict'

module.exports = (sequelize, DataTypes) => {
  let agentPaymentProvider = sequelize.define('agentPaymentProvider', {
    agentId: DataTypes.INTEGER,
    paymentProviderId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  agentPaymentProvider.associate = (models) => {
    agentPaymentProvider.belongsTo(models.agent, { foreignKey: 'agentId' })
    agentPaymentProvider.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })

    agentPaymentProvider.addScope('agent', () => ({
      attributes: ['id'],
      include: [
        {
          model: models.paymentProvider.scope('excludeTimestamp', 'excludeShare'),
          include: [
            models.paymentProviderType.scope('excludeTimestamp'),
            models.paymentProviderConfig.scope('excludeTimestamp', 'excludeConfig')
          ]
        }
      ]
    }))
  }
  return agentPaymentProvider
}
