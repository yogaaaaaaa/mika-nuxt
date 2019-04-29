'use strict'

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

    extra: {
      type: DataTypes.TEXT,
      get () {
        try {
          return JSON.parse(this.getDataValue('extra'))
        } catch (error) {}
      },
      set (val) {
        if (typeof val === 'object') {
          this.setDataValue('extra', JSON.stringify(val))
        }
      }
    },

    agentId: DataTypes.INTEGER,
    terminalId: DataTypes.INTEGER,
    paymentProviderId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  transaction.associate = (models) => {
    transaction.belongsTo(models.agent, { foreignKey: 'agentId' })
    transaction.belongsTo(models.terminal, { foreignKey: 'terminalId' })
    transaction.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })

    transaction.hasMany(models.transactionRefund, { foreignKey: 'transactionId' })

    transaction.addScope('agent', () => ({
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: models.paymentProvider.scope(
            'excludeShare',
            'excludeTimestamp'
          ),
          include: [
            models.paymentProviderType.scope('excludeTimestamp'),
            models.paymentProviderConfig.scope(
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
        attributes: { exclude: ['deletedAt'] },
        include: [
          {
            model: models.paymentProvider,
            include: [
              models.paymentProviderType
            ]
          },
          {
            model: models.agent,
            required: true,
            include: [
              {
                model: models.merchant,
                where: whereMerchant
              }
            ]
          }
        ]
      }
    })
    transaction.addScope('validPartner', (partnerId) => ({
      include: [
        {
          model: models.agent.scope('onlyId'),
          include: [
            {
              model: models.merchant.scope('onlyId'),
              where: { partnerId }
            }
          ]
        }
      ]
    }))
    transaction.addScope('trxManager', () => ({
      include: [
        {
          model: models.agent,
          include: [ models.merchant ]
        },
        {
          model: models.paymentProvider,
          include: [
            models.paymentProviderType,
            models.paymentProviderConfig
          ]
        }
      ]
    }))
  }

  return transaction
}
