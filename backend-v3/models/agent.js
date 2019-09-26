'use strict'

const query = require('./helpers/query')

module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Op = Sequelize.Op

  const agent = sequelize.define('agent', {
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
        model: sequelize.models.outlet.scope('excludeTimestamp', 'excludeBusiness', 'excludeMerchantId'),
        include: [
          sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank', 'excludePartner')
        ]
      }
    ]
  }))
  agent.addScope('merchantStaff', (merchantStaffId) => ({
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
        model: sequelize.models.outlet.scope('excludeMerchantId'),
        paranoid: false
      }
    ]
  }))

  agent.addScope('acquirerStaff', (acquirerCompanyId) => ({
    paranoid: false,
    where: {
      [Op.and]: [
        {
          outletId: {
            [Op.in]: Sequelize.literal(
              query.get('sub/getOutletByAcquirerCompany.sql', [sequelize.escape(acquirerCompanyId)])
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
  }))

  agent.addScope('agentAcquirer', (acquirerId) => {
    const whereAcquirer = {
      acquirerConfigId: {
        [Op.not]: null
      }
    }
    if (acquirerId) whereAcquirer.id = acquirerId

    return {
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
                  model: sequelize.models.acquirer.scope(
                    { method: ['agentExclusion', '`agent`.`id`'] },
                    'excludeShare'
                  ),
                  where: whereAcquirer,
                  include: [
                    {
                      model: sequelize.models.acquirerType,
                      required: true
                    },
                    {
                      model: sequelize.models.acquirerConfig.scope('excludeConfig'),
                      required: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  })

  agent.addScope('partner', (partnerId, merchantId) => {
    const whereMerchant = {}

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
    paranoid: false,
    include: [
      {
        model: sequelize.models.outlet,
        paranoid: false,
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
  agent.addScope('adminUpdate', () => ({
    paranoid: false,
    include: [
      sequelize.models.user
    ]
  }))

  return agent
}
