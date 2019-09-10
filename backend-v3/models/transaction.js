'use strict'

const kv = require('./helpers/kv')
const query = require('./helpers/query')

module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Op = Sequelize.Op

  let transaction = sequelize.define('transaction', {
    id: {
      primaryKey: true,
      type: DataTypes.CHAR(27)
    },

    idAlias: DataTypes.CHAR(40),

    amount: DataTypes.DECIMAL(28, 2),

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
    cardPanMasked: DataTypes.STRING,
    cardType: DataTypes.STRING,

    aliasThumbnail: DataTypes.STRING,
    aliasThumbnailGray: DataTypes.STRING,

    locationLong: DataTypes.DECIMAL(12, 8),
    locationLat: DataTypes.DECIMAL(12, 8),
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

  transaction.associate = (models) => {
    transaction.belongsTo(models.agent, { foreignKey: 'agentId' })
    transaction.belongsTo(models.terminal, { foreignKey: 'terminalId' })
    transaction.belongsTo(models.acquirer, { foreignKey: 'acquirerId' })
    transaction.hasMany(models.transactionExtraKv, { foreignKey: 'transactionId' })

    transaction.hasMany(models.transactionRefund, { foreignKey: 'transactionId' })
  }

  transaction.addScope('transactionExtraKv', () => ({
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity')
    ]
  }))

  transaction.addScope('agent', () => ({
    attributes: {
      exclude: ['token', 'userToken', 'ipAddress']
    },
    include: [
      sequelize.models.transactionExtraKv.scope('excludeEntity'),
      sequelize.models.transactionRefund.scope('excludeTransactionId'),
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
      sequelize.models.transactionRefund.scope('excludeTransactionId'),
      {
        model: sequelize.models.agent.scope('excludeTimestamp'),
        include: [
          sequelize.models.outlet.scope('excludeBusiness', 'excludeTimestamp')
        ],
        where: {
          [Op.and]: [
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  query.get('sub/getOutletByMerchantStaff.sql', [ sequelize.escape(merchantStaffId) ])
                )
              }
            },
            outletId ? { outletId } : undefined
          ]
        }
      },
      {
        required: true,
        model: sequelize.models.acquirer.scope('excludeTimestamp'),
        include: [
          sequelize.models.acquirerType.scope('excludeTimestamp')
        ]
      }
    ]
  }))
  // TODO: This query is HORRIBLE, please fix ASAP
  transaction.addScope('merchantStaffAcquirerTransactionStats', (merchantStaffId) => ({
    attributes: [
      'acquirerId',
      [
        Sequelize.literal(
          'SUM(`transaction`.`amount`)'
        ),
        'totalAmountNoRefund'
      ],
      [
        Sequelize.literal(
          `SUM(\`transaction\`.\`amount\` - IFNULL(${query.get('sub/getTransactionRefundSum.sql', [ '`transaction`.`id`' ])}, 0) ) `
        ),
        'totalAmount'
      ],
      [
        Sequelize.literal(
          'SUM(' +
            'GREATEST(' +
              '(' +
                `(\`transaction\`.\`amount\` - IFNULL(${query.get('sub/getTransactionRefundSum.sql', [ '`transaction`.`id`' ])}, 0)` +
                ' * IFNULL(`acquirer`.`shareMerchant`, 1))' +
              ')' +
              ' - IFNULL(`acquirer`.`processFee`, 0)' +
            ', 0)' +
          ')'
        ),
        'totalNettAmount'
      ],
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
                query.get('sub/getOutletByMerchantStaff.sql', [ sequelize.escape(merchantStaffId) ])
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
                  query.get('sub/getOutletByMerchantStaff.sql', [ sequelize.escape(merchantStaffId) ])
                )
              }
            }
          ]
        }
      }
    ]
  }))

  // TODO: This query is HORRIBLE, please fix ASAP
  transaction.addScope('merchantStaffReportOutletTransactionStats', (merchantStaffId) => ({
    attributes: [
      [
        Sequelize.literal(
          'SUM(`transaction`.`amount`)'
        ),
        'totalAmountNoRefund'
      ],
      [
        Sequelize.literal(
          `SUM(\`transaction\`.\`amount\` - IFNULL(${query.get('sub/getTransactionRefundSum.sql', [ '`transaction`.`id`' ])}, 0) ) `
        ),
        'totalAmount'
      ],
      [
        Sequelize.literal(
          'SUM(' +
            'GREATEST(' +
              '(' +
                `(\`transaction\`.\`amount\` - IFNULL(${query.get('sub/getTransactionRefundSum.sql', [ '`transaction`.`id`' ])}, 0)` +
                ' * IFNULL(`acquirer`.`shareMerchant`, 1))' +
              ')' +
              ' - IFNULL(`acquirer`.`processFee`, 0)' +
            ', 0)' +
          ')'
        ),
        'totalNettAmount'
      ],
      [Sequelize.fn('COUNT', Sequelize.col('transaction.id')), 'transactionCount']
    ],
    group: [
      Sequelize.col('agent.outletId')
    ],
    include: [
      {
        required: true,
        model: sequelize.models.acquirer,
        attributes: [ 'id' ]
      },
      {
        model: sequelize.models.agent,
        attributes: [ 'id', 'outletId' ],
        include: [sequelize.models.outlet],
        where: {
          [Op.and]: {
            outletId: {
              [Op.in]: Sequelize.literal(
                query.get('sub/getOutletByMerchantStaff.sql', [ sequelize.escape(merchantStaffId) ])
              )
            }
          }
        }
      }
    ]
  }))
  transaction.addScope('merchantStaffReport', (merchantStaffId) => ({
    include: [
      {
        model: sequelize.models.agent,
        include: [ sequelize.models.outlet ],
        where: {
          [Op.and]: [
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  query.get('sub/getOutletByMerchantStaff.sql', [ sequelize.escape(merchantStaffId) ])
                )
              }
            }
          ]
        }
      },
      {
        required: true,
        model: sequelize.models.acquirer,
        include: [
          sequelize.models.acquirerType
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
    attributes: {
      include: [
        [ Sequelize.literal(query.get('sub/getTransactionRefundSum.sql', [ '`transaction`.`id`' ])), 'totalRefundAmount' ]
      ]
    }
  }))

  transaction.addScope('admin', () => ({
    include: [
      {
        model: sequelize.models.agent,
        attributes: [
          'id',
          'name',
          'outletId'
        ],
        include: [
          {
            model: sequelize.models.outlet,
            attributes: [
              'id',
              'name',
              'merchantId'
            ]
          }
        ]
      },
      {
        model: sequelize.models.acquirer.scope('acquirerType')
      }
    ]
  }))

  return transaction
}
