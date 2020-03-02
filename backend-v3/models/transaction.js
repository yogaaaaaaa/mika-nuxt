'use strict'

const cipherbox = require('libs/cipherbox')
const query = require('./helpers/query')

const { transactionStatuses } = require('libs/trxManager/constants')

module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Op = Sequelize.Op

  const transaction = sequelize.define('transaction', {
    id: {
      primaryKey: true,
      type: DataTypes.STRING(27)
    },

    idAlias: DataTypes.STRING(40),

    amount: DataTypes.DECIMAL(28, 2),

    status: DataTypes.STRING(32),

    token: DataTypes.STRING,
    tokenType: DataTypes.STRING,

    userToken: DataTypes.STRING,
    userTokenType: DataTypes.STRING,

    reference: DataTypes.STRING,
    referenceName: DataTypes.STRING,

    // Deprecated
    referenceNumber: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['reference']),
      get () {
        return this.get('reference')
      }
    },

    customerReference: DataTypes.STRING,
    customerReferenceName: DataTypes.STRING,

    authorizationReference: DataTypes.STRING,
    authorizationReferenceName: DataTypes.STRING,

    acquirerUtcOffset: DataTypes.STRING,
    voidAcquirerTimeAt: DataTypes.DATE,

    voidReference: DataTypes.STRING,
    voidReferenceName: DataTypes.STRING,

    traceNumber: DataTypes.INTEGER,

    voidAuthorizationReference: DataTypes.STRING,
    voidAuthorizationReferenceName: DataTypes.STRING,

    voidTraceNumber: DataTypes.INTEGER,

    acquirerTimeAt: DataTypes.DATE,

    agentOrderReference: DataTypes.STRING,

    processFee: DataTypes.DECIMAL(28, 2),
    shareAcquirer: DataTypes.DECIMAL(5, 4),
    shareMerchant: DataTypes.DECIMAL(5, 4),

    locationLong: DataTypes.DECIMAL(12, 8),
    locationLat: DataTypes.DECIMAL(12, 8),
    ipAddress: DataTypes.STRING,

    aliasThumbnail: DataTypes.STRING,
    aliasThumbnailGray: DataTypes.STRING,

    description: DataTypes.STRING,
    voidReason: DataTypes.STRING,

    references: DataTypes.JSONB,
    properties: DataTypes.JSONB,
    encryptedProperties: DataTypes.JSONB,

    settleBatchInId: DataTypes.INTEGER,
    settleBatchId: DataTypes.INTEGER,

    agentId: DataTypes.INTEGER,
    terminalId: DataTypes.INTEGER,
    acquirerId: DataTypes.INTEGER,

    acquirerConfigAgentId: DataTypes.INTEGER,
    acquirerConfigOutletId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false,
    hooks: {
      async beforeSave (transaction) {
        transaction._encryptedProperties = transaction.encryptedProperties
        if (
          transaction.encryptedPropertiesKey &&
          transaction.changed('encryptedProperties')
        ) {
          const createResult = cipherbox.createCb0({
            data: JSON.stringify(transaction.encryptedProperties),
            key: transaction.encryptedPropertiesKey
          })
          if (createResult) transaction.encryptedProperties = createResult.box
        }
      },
      async afterSave (transaction) {
        transaction.encryptedProperties = transaction._encryptedProperties
      }
    }
  })

  transaction.prototype.setupEncryptedProperties = function (keyBuffer) {
    this.encryptedPropertiesKey = keyBuffer
    const openResult = cipherbox.openCb0({
      box: this.encryptedProperties,
      key: this.encryptedPropertiesKey,
      tsTolerance: null
    })
    if (openResult) {
      this.encryptedProperties = JSON.parse(openResult.data.toString())
      return this.encryptedProperties
    }
  }

  transaction.associate = (models) => {
    transaction.belongsTo(models.agent, { foreignKey: 'agentId' })
    transaction.belongsTo(models.terminal, { foreignKey: 'terminalId' })
    transaction.belongsTo(models.acquirer, { foreignKey: 'acquirerId' })

    transaction.belongsTo(models.settleBatch, { foreignKey: 'settleBatchId' })
    transaction.belongsTo(models.settleBatchIn, { foreignKey: 'settleBatchInId' })

    transaction.belongsTo(models.acquirerConfigAgent, { foreignKey: 'acquirerConfigAgentId' })
    transaction.belongsTo(models.acquirerConfigOutlet, { foreignKey: 'acquirerConfigOutletId' })

    transaction.hasMany(models.transactionRefund, { foreignKey: 'transactionId' })
  }

  transaction.addScope('agent', (agentId) => ({
    where: agentId ? { agentId } : {},
    attributes: {
      exclude: [
        'token',
        'userToken',
        'ipAddress',
        'processFee',
        'shareAcquirer',
        'shareMerchant',
        'encryptedProperties'
      ]
    },
    include: [
      sequelize.models.transactionRefund.scope('excludeTransactionId'),
      {
        model: sequelize.models.settleBatchIn,
        paranoid: false
      },
      {
        model: sequelize.models.settleBatch,
        paranoid: false
      },
      {
        model: sequelize.models.agent,
        paranoid: false
      },
      {
        model: sequelize.models.acquirer.scope('excludeShare'),
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerType,
            paranoid: false
          },
          {
            model: sequelize.models.acquirerConfig.scope('excludeConfig'),
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.acquirerConfigAgent.scope('excludeConfig'),
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerTerminal.scope('excludeConfig'),
            paranoid: false,
            include: [
              {
                model: sequelize.models.acquirerTerminalCommon.scope('excludeConfig'),
                paranoid: false,
                include: [
                  {
                    model: sequelize.models.acquirerCompany,
                    paranoid: false
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        model: sequelize.models.acquirerConfigOutlet.scope('excludeConfig'),
        paranoid: false
      },
      {
        model: sequelize.models.settleBatchIn,
        paranoid: false
      },
      {
        model: sequelize.models.settleBatch,
        paranoid: false
      }
    ]
  }))
  transaction.addScope('merchantStaff', (merchantStaffId, outletId) => ({
    include: [
      sequelize.models.transactionRefund.scope('excludeTransactionId'),
      {
        model: sequelize.models.agent,
        paranoid: false,
        where: {
          [Op.and]: [
            outletId ? { outletId } : undefined,
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  query.get('sub/getOutletByMerchantStaff.sql', [sequelize.escape(merchantStaffId)])
                )
              }
            }
          ]
        },
        include: [
          {
            model: sequelize.models.outlet.scope('excludeBusiness'),
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.acquirer,
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerType,
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.settleBatchIn,
        paranoid: false
      },
      {
        model: sequelize.models.settleBatch,
        paranoid: false
      }
    ]
  }))
  transaction.addScope('acquirerStaff', acquirerCompanyId => ({
    include: [
      sequelize.models.transactionRefund.scope('excludeTransactionId'),
      {
        model: sequelize.models.acquirer,
        paranoid: false,
        required: true,
        include: [
          {
            model: sequelize.models.acquirerType,
            paranoid: false
          },
          {
            model: sequelize.models.acquirerCompany,
            paranoid: false,
            where: {
              id: acquirerCompanyId
            }
          }
        ]
      },
      {
        model: sequelize.models.agent,
        paranoid: false,
        include: [
          {
            model: sequelize.models.outlet.scope('excludeBusiness'),
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.settleBatchIn,
        paranoid: false
      },
      {
        model: sequelize.models.settleBatch,
        paranoid: false
      }
    ]
  }))
  transaction.addScope('admin', () => ({
    include: [
      {
        model: sequelize.models.agent,
        paranoid: false,
        attributes: [
          'id',
          'name',
          'outletId'
        ],
        include: [
          {
            model: sequelize.models.outlet,
            paranoid: false,
            attributes: [
              'id',
              'name',
              'merchantId'
            ],
            include: [
              {
                model: sequelize.models.merchant.scope('id', 'name'),
                paranoid: false
              }
            ]
          }
        ]
      },
      {
        model: sequelize.models.acquirer,
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerType,
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.settleBatchIn,
        paranoid: false
      },
      {
        model: sequelize.models.settleBatch,
        paranoid: false
      }
    ]
  }))
  transaction.addScope('totalRefundAmount', () => ({
    attributes: {
      include: [
        [
          Sequelize.literal(query.get('sub/getTransactionRefundSum.sql', ['"transaction"."id"'])),
          'totalRefundAmount'
        ]
      ]
    }
  }))
  transaction.addScope('totalSuccessAmount', {
    attributes: [
      [
        Sequelize.literal(
          query.get('sub/getTransactionSumWithRefundSum.sql')
        ),
        'totalAmount'
      ],
      [
        sequelize.fn('count', sequelize.col('transaction.id')),
        'transactionCount'
      ]
    ],
    where: {
      status: {
        [Op.in]: [
          transactionStatuses.SUCCESS,
          transactionStatuses.REFUNDED_PARTIAL
        ]
      }
    }
  })

  // TODO: This query is HORRIBLE, please fix ASAP
  // TODO: This query is not working in postgres
  transaction.addScope('merchantStaffAcquirerTransactionStats', (merchantStaffId) => ({
    attributes: [
      'acquirerId',
      [
        Sequelize.literal(
          'SUM("transaction"."amount")'
        ),
        'totalAmountNoRefund'
      ],
      [
        Sequelize.literal(
        `SUM("transaction"."amount" - COALESCE(${query.get('sub/getTransactionRefundSum.sql', ['"transaction"."id"'])}, 0) ) `
        ),
        'totalAmount'
      ],
      [
        Sequelize.literal(
          'SUM(' +
        'GREATEST(' +
        '(' +
        `(("transaction"."amount" - COALESCE(${query.get('sub/getTransactionRefundSum.sql', ['"transaction"."id"'])}, 0))` +
        ' * COALESCE("transaction"."shareMerchant", 1))' +
        ')' +
        ' - COALESCE("transaction"."processFee", 0)' +
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
        model: sequelize.models.acquirer,
        paranoid: false,
        attributes: [],
        include: [
          {
            model: sequelize.models.acquirerType,
            paranoid: false,
            attributes: []
          }
        ]
      },
      {
        model: sequelize.models.agent,
        paranoid: false,
        attributes: [],
        where: {
          [Op.and]: {
            outletId: {
              [Op.in]: Sequelize.literal(
                query.get('sub/getOutletByMerchantStaff.sql', [sequelize.escape(merchantStaffId)])
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
        paranoid: false,
        attributes: [],
        where: {
          [Op.and]: [
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  query.get('sub/getOutletByMerchantStaff.sql', [sequelize.escape(merchantStaffId)])
                )
              }
            }
          ]
        }
      }
    ]
  }))

  // TODO: This query is HORRIBLE, please fix ASAP
  // TODO: This query is not working in postgres
  transaction.addScope('merchantStaffReportOutletTransactionStats', (merchantStaffId) => ({
    attributes: [
      [
        Sequelize.literal(
          'SUM("transaction"."amount")'
        ),
        'totalAmountNoRefund'
      ],
      [
        Sequelize.literal(
        `SUM("transaction"."amount" - COALESCE(${query.get('sub/getTransactionRefundSum.sql', ['"transaction"."id"'])}, 0) ) `
        ),
        'totalAmount'
      ],
      [
        Sequelize.literal(
          'SUM(' +
        'GREATEST(' +
        '(' +
        `(("transaction"."amount" - COALESCE(${query.get('sub/getTransactionRefundSum.sql', ['"transaction"."id"'])}, 0))` +
        ' * COALESCE("transaction"."shareMerchant", 1))' +
        ')' +
        ' - COALESCE("transaction"."processFee", 0)' +
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
        model: sequelize.models.acquirer,
        paranoid: false,
        attributes: ['id']
      },
      {
        model: sequelize.models.agent,
        paranoid: false,
        attributes: ['id', 'outletId'],
        include: [sequelize.models.outlet],
        where: {
          [Op.and]: {
            outletId: {
              [Op.in]: Sequelize.literal(
                query.get('sub/getOutletByMerchantStaff.sql', [sequelize.escape(merchantStaffId)])
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
        paranoid: false,
        where: {
          [Op.and]: [
            {
              outletId: {
                [Op.in]: Sequelize.literal(
                  query.get('sub/getOutletByMerchantStaff.sql', [sequelize.escape(merchantStaffId)])
                )
              }
            }
          ]
        },
        include: [
          {
            model: sequelize.models.outlet,
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.acquirer,
        paranoid: false,
        include: [
          {
            model: sequelize.models.acquirerType,
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.settleBatchIn,
        paranoid: false
      },
      {
        model: sequelize.models.settleBatch,
        paranoid: false
      }
    ]
  }))

  return transaction
}
