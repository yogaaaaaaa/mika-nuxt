'use strict'

module.exports = (sequelize, DataTypes) => {
  let agentPaymentGateway = sequelize.define('agentPaymentProvider', {
    agentId: DataTypes.INTEGER,
    paymentProviderId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  agentPaymentGateway.associate = (models) => {
    agentPaymentGateway.belongsTo(models.agent, { foreignKey: 'agentId' })
    agentPaymentGateway.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })
  }
  return agentPaymentGateway
}
