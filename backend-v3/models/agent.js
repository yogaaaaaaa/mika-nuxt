'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

const script = require('../libs/script')

module.exports = (sequelize, DataTypes) => {
  let agent = sequelize.define('agent', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    generalLocationLong: DataTypes.DECIMAL(12, 8),
    generalLocationLat: DataTypes.DECIMAL(12, 8),
    generalLocationRadiusMeter: DataTypes.DECIMAL(10, 2),

    userId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  agent.associate = (models) => {
    agent.belongsTo(models.user, { foreignKey: 'userId' })
    agent.belongsTo(models.outlet, { foreignKey: 'outletId' })

    agent.hasMany(models.transaction, { foreignKey: 'agentId' })
  }

  agent.addScope('agent', () => ({
    attributes: { exclude: ['archivedAt'] },
    include: [
      {
        model: sequelize.models.outlet.scope('excludeTimestamp', 'excludeBusiness', 'excludeMerchant'),
        include: [
          sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank', 'excludePartner')
        ]
      }
    ]
  }))
  agent.addScope('merchantStaff', (merchantStaffId) => ({
    attributes: { exclude: ['archivedAt'] },
    include: [
      sequelize.models.outlet.scope('excludeDeletedAt', 'excludeMerchant')
    ],
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
  }))
  agent.addScope('agentAcquirer', (acquirerId) => ({
    attributes: ['id'],
    include: [
      {
        model: sequelize.models.outlet.scope('id'),
        required: true,
        include: [
          {
            model: sequelize.models.merchant.scope('id'),
            required: true,
            include: [
              {
                where: acquirerId ? { id: acquirerId } : undefined,
                model: sequelize.models.acquirer.scope(
                  { method: ['agentExclusion', '`agent`.`id`'] },
                  'excludeTimestamp',
                  'excludeShare'
                ),
                include: [
                  sequelize.models.acquirerType.scope('excludeTimestamp'),
                  sequelize.models.acquirerConfig.scope('excludeTimestamp', 'excludeConfig')
                ]
              }
            ]
          }
        ]
      }
    ]
  }))
  agent.addScope('trxManager', (acquirerId) => ({
    include: [
      {
        model: sequelize.models.outlet.scope('id'),
        required: true,
        include: [
          {
            model: sequelize.models.merchant,
            required: true,
            include: [
              {
                model: sequelize.models.acquirer.scope(
                  'acquirerType',
                  'acquirerConfig',
                  { method: ['agentExclusion', '`agent`.`id`'] }
                ),
                where: acquirerId ? { id: acquirerId } : undefined,
                required: false
              }
            ]
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
          model: sequelize.models.outlet,
          include: [
            {
              model: sequelize.models.merchant,
              where: whereMerchant,
              include: [
                {
                  model: sequelize.models.acquirer.scope(
                    { method: ['agentExclusion', '`agent`.`id`'] }
                  ),
                  include: [
                    sequelize.models.acquirerType
                  ],
                  required: false
                }
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
  agent.addScope('admin', () => ({
    include: [
      {
        model: sequelize.models.outlet,
        attributes: [
          'id',
          'name',
          'description',
          'merchantId'
        ]
      },
      sequelize.models.user.scope('excludePassword')
    ]
  }))

  return agent
}
