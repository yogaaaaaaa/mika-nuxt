'use strict'

const kv = require('./helpers/kv')

module.exports = (sequelize, DataTypes) => {
  let transaction = sequelize.define('transaction', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    idAlias: DataTypes.CHAR(40),

    amount: DataTypes.INTEGER,

    status: DataTypes.CHAR(32),
    settlementStatus: DataTypes.CHAR(32),

    token: DataTypes.STRING,
    tokenType: DataTypes.STRING,

    userToken: DataTypes.STRING,
    userTokenType: DataTypes.STRING,

    customerReference: DataTypes.STRING,
    customerReferenceName: DataTypes.STRING,
    referenceNumber: DataTypes.STRING,
    referenceNumberName: DataTypes.STRING,

    cardApprovalCode: DataTypes.STRING,
    cardNetwork: DataTypes.STRING,
    cardIssuer: DataTypes.STRING,
    cardAcquirer: DataTypes.STRING,
    cardPan: DataTypes.STRING,
    cardType: DataTypes.STRING,

    aliasThumbnail: DataTypes.STRING,
    aliasThumbnailGray: DataTypes.STRING,

    locationLong: DataTypes.STRING,
    locationLat: DataTypes.STRING,
    ipAddress: DataTypes.STRING,

    voidReason: DataTypes.TEXT,
    agentId: DataTypes.INTEGER,
    terminalId: DataTypes.INTEGER,
    paymentProviderId: DataTypes.INTEGER,

    extra: {
      type: DataTypes.VIRTUAL,
      get: kv.selfKvGetter('transactionExtraKvs')
    }
  }, {
    freezeTableName: true,
    paranoid: true
  })

  transaction.addScope('transactionExtraKv', () => ({
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity')
    ]
  }))
  transaction.addScope('agent', () => ({
    attributes: { exclude: ['deletedAt'] },
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity'),
      {
        model: sequelize.models.paymentProvider.scope(
          'excludeShare',
          'excludeTimestamp'
        ),
        include: [
          sequelize.models.paymentProviderType.scope(
            'excludeTimestamp'
          ),
          sequelize.models.paymentProviderConfig.scope(
            'excludeTimestamp',
            'excludeConfig'
          )
        ]
      }
    ]
  }))
  transaction.addScope('partner', (partnerId, merchantId) => {
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
          model: sequelize.models.paymentProvider,
          include: [
            sequelize.models.paymentProviderType
          ]
        },
        {
          model: sequelize.models.agent,
          required: true,
          include: [
            {
              model: sequelize.models.merchant,
              where: whereMerchant
            }
          ]
        }
      ]
    }
  })
  transaction.addScope('validPartner', (partnerId) => ({
    attributes: ['id'],
    include: [
      {
        model: sequelize.models.agent.scope('id'),
        include: [
          {
            model: sequelize.models.merchant.scope('id'),
            where: { partnerId }
          }
        ]
      }
    ]
  }))
  transaction.addScope('trxManager', () => ({
    include: [
      {
        model: sequelize.models.agent,
        include: [ sequelize.models.merchant ]
      },
      {
        model: sequelize.models.paymentProvider.scope(
          'paymentProviderType',
          'paymentProviderConfig'
        )
      }
    ]
  }))

  transaction.setKv = kv.setKvMethod('transactionId')
  transaction.getKv = kv.getKvMethod('transactionId')

  transaction.associate = (models) => {
    transaction.belongsTo(models.agent, { foreignKey: 'agentId' })
    transaction.belongsTo(models.terminal, { foreignKey: 'terminalId' })
    transaction.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })
    transaction.hasMany(models.transactionExtraKv, { foreignKey: 'transactionId' })

    transaction.hasMany(models.transactionRefund, { foreignKey: 'transactionId' })
  }

  return transaction
}
