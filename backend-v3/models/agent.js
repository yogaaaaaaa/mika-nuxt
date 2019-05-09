'use strict'

module.exports = (sequelize, DataTypes) => {
  let agent = sequelize.define('agent', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    generalLocationLong: DataTypes.STRING,
    generalLocationLat: DataTypes.STRING,
    generalLocationRadiusMeter: DataTypes.FLOAT,

    secure: DataTypes.BOOLEAN,

    userId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  agent.addScope('agent', () => ({
    attributes: { exclude: ['deletedAt'] },
    include: [
      sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank', 'excludePartner'),
      sequelize.models.outlet.scope('excludeTimestamp', 'excludeBusiness', 'excludeMerchant')
    ]
  }))
  agent.addScope('agentPaymentProvider', (paymentProviderId) => ({
    attributes: ['id', 'merchantId'], // NOTE: merchantId need to included or query will fail, bug in sequelize maybe ?
    include: [
      {
        model: sequelize.models.merchant.scope('id'),
        include: [
          {
            where: paymentProviderId ? { id: paymentProviderId } : undefined,
            model: sequelize.models.paymentProvider.scope(
              { method: ['agentExclusion', '`agent`.`id`'] },
              'excludeTimestamp',
              'excludeShare'
            ),
            include: [
              sequelize.models.paymentProviderType.scope('excludeTimestamp'),
              sequelize.models.paymentProviderConfig.scope('excludeTimestamp', 'excludeConfig')
            ]
          }
        ]
      }
    ]
  }))
  agent.addScope('trxManager', (paymentProviderId) => ({
    include: [
      {
        model: sequelize.models.merchant,
        include: [
          {
            where: paymentProviderId ? { id: paymentProviderId } : undefined,
            required: false,
            model: sequelize.models.paymentProvider.scope(
              'paymentProviderType',
              'paymentProviderConfig',
              { method: ['agentExclusion', '`agent`.`id`'] }
            )
          }
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
          model: sequelize.models.merchant,
          where: whereMerchant,
          include: [
            {
              model: sequelize.models.paymentProvider.scope(
                { method: ['agentExclusion', '`agent`.`id`'] }
              ),
              required: false,
              include: [
                sequelize.models.paymentProviderType
              ]
            }
          ]
        }
      ]
    }
  })
  agent.addScope('validPartner', (partnerId) => ({
    attributes: ['id'],
    include: [
      {
        model: sequelize.models.merchant.scope('id'),
        where: {
          partnerId
        }
      }
    ]
  }))

  agent.associate = (models) => {
    agent.belongsTo(models.user, { foreignKey: 'userId' })
    agent.belongsTo(models.outlet, { foreignKey: 'outletId' })
    agent.belongsTo(models.merchant, { foreignKey: 'merchantId' })

    agent.hasMany(models.transaction, { foreignKey: 'agentId' })
  }

  return agent
}
