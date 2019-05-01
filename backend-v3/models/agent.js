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

    agent.addScope('agent', () => ({
      attributes: { exclude: ['deletedAt'] },
      include: [
        models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank', 'excludePartner'),
        models.outlet.scope('excludeTimestamp', 'excludeBusiness', 'excludeMerchant')
      ]
    }))

    agent.addScope('trxManager', (paymentProviderId) => ({
      include: [
        {
          model: models.merchant
        },
        {
          model: models.paymentProvider,
          required: false,
          where: paymentProviderId ? { id: paymentProviderId } : undefined,
          include: [
            models.paymentProviderType,
            models.paymentProviderConfig
          ]
        }
      ]
    }))

    agent.addScope('partner', (partnerId, merchantId) => {
      let whereMerchant = {}

      if (partnerId) {
        whereMerchant.partnerId = partnerId
      }

      if (merchantId) {
        whereMerchant.id = merchantId
      }

      return {
        include: [
          {
            model: models.paymentProvider,
            include: [
              models.paymentProviderType
            ]
          },
          {
            model: models.merchant,
            where: whereMerchant
          }
        ]
      }
    })

    agent.addScope('validPartner', (partnerId) => ({
      attributes: ['id'],
      include: [
        {
          model: models.merchant.scope('onlyId'),
          where: {
            partnerId
          }
        }
      ]
    }))
  }

  return agent
}
