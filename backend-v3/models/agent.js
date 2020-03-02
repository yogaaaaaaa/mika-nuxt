'use strict'

const query = require('./helpers/query')
const counter = require('./helpers/counter')

module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Op = Sequelize.Op

  const agent = sequelize.define('agent', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    traceNumberCounter: DataTypes.INTEGER,

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

  agent.prototype.incrementTraceCounter = counter.generateCounterFunction({
    attribute: 'traceNumberCounter',
    max: 999000
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
          sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank')
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
                    { method: ['agentExclusion', '"agent"."id"'] },
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

  agent.addScope('agentWithoutAcquirerConfigAgent', (acquirerConfigId) => ({
    paranoid: false,
    where: {
      id: {
        [Op.notIn]: Sequelize.literal(
          query.get('sub/getAgentInAcquirerConfigAgentByAcquirerConfig.sql', [sequelize.escape(acquirerConfigId)])
        )
      }
    },
    include: [
      {
        model: sequelize.models.outlet.scope('id', 'name'),
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
        ],
        include: [
          sequelize.models.merchant.scope('id', 'name', 'paranoid')
        ]
      },
      sequelize.models.user.scope('excludePassword')
    ]
  }))

  return agent
}
