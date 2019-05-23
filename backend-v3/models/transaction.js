'use strict'

const kv = require('./helpers/kv')

const Sequelize = require('sequelize')
const Op = Sequelize.Op

const script = require('../libs/script')

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
    acquirerId: DataTypes.INTEGER,

    extra: {
      type: DataTypes.VIRTUAL,
      get: kv.selfKvGetter('transactionExtraKvs')
    }
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false
  })

  transaction.addScope('transactionExtraKv', () => ({
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity')
    ]
  }))

  transaction.addScope('agent', () => ({
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity'),
      {
        required: true,
        model: sequelize.models.acquirer.scope(
          'excludeShare',
          'excludeTimestamp'
        ),
        include: [
          sequelize.models.acquirerType.scope(
            'excludeTimestamp'
          ),
          sequelize.models.acquirerConfig.scope(
            'excludeTimestamp',
            'excludeConfig'
          )
        ]
      }
    ]
  }))
  transaction.addScope('merchantStaff', (merchantStaffId, outletId) => ({
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity'),
      {
        model: sequelize.models.agent.scope('excludeTimestamp'),
        where: {
          [Op.and]: [
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  script.get('subquery/getOutletByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
                )
              }
            },
            outletId ? { outletId } : undefined
          ]
        }
      },
      {
        required: true,
        model: sequelize.models.acquirer.scope('excludeShare', 'excludeTimestamp'),
        include: [
          sequelize.models.acquirerType.scope('excludeTimestamp')
        ]
      }
    ]
  }))
  transaction.addScope('merchantStaffAcquirerTransactionStats', (merchantStaffId) => ({
    attributes: [
      'acquirerId',
      [Sequelize.literal('SUM(`transaction`.`amount`)'), 'amount'],
      [Sequelize.literal('SUM(`transaction`.`amount` * `acquirer`.`shareMerchant`)'), 'nettAmount'],
      [Sequelize.fn('COUNT', Sequelize.col('transaction.id')), 'transactionCount']
    ],
    group: [
      'acquirerId'
    ],
    include: [
      {
        required: true,
        model: sequelize.models.acquirer,
        attributes: [ 'id', 'name', 'description', 'shareMerchant', 'merchantId', 'acquirerTypeId' ],
        include: [
          {
            model: sequelize.models.acquirerType,
            attributes: [ 'id', 'class', 'name', 'description', 'thumbnail', 'thumbnailGray', 'chartColor' ]
          }
        ]
      },
      {
        model: sequelize.models.agent,
        attributes: [ 'id', 'outletId' ],
        where: {
          [Op.and]: {
            outletId: {
              [Op.in]: Sequelize.literal(
                script.get('subquery/getOutletByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
              )
            }
          }
        }
      }
    ]
  }))
  transaction.addScope('merchantStaffTransactionTimeGroupCount', (merchantStaffId) => ({
    attributes: [
      [Sequelize.fn('COUNT', '*'), 'transactionCount']
    ],
    include: [
      {
        model: sequelize.models.agent,
        attributes: ['outletId'],
        where: {
          [Op.and]: [
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  script.get('subquery/getOutletByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
                )
              }
            }
          ]
        }
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
          model: sequelize.models.acquirer,
          include: [
            sequelize.models.acquirerType
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
        model: sequelize.models.acquirer.scope(
          'acquirerType',
          'acquirerConfig'
        )
      }
    ]
  }))

  transaction.associate = (models) => {
    transaction.belongsTo(models.agent, { foreignKey: 'agentId' })
    transaction.belongsTo(models.terminal, { foreignKey: 'terminalId' })
    transaction.belongsTo(models.acquirer, { foreignKey: 'acquirerId' })
    transaction.hasMany(models.transactionExtraKv, { foreignKey: 'transactionId' })

    transaction.hasMany(models.transactionRefund, { foreignKey: 'transactionId' })
  }

  return transaction
}
