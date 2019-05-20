'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

const script = require('../helpers/script')

module.exports = (sequelize, DataTypes) => {
  let agent = sequelize.define('agent', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    generalLocationLong: DataTypes.STRING,
    generalLocationLat: DataTypes.STRING,
    generalLocationRadiusMeter: DataTypes.FLOAT,

    userId: DataTypes.INTEGER,
    outletId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    timestamps: true,
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
  agent.addScope('merchantStaff', (merchantStaffId) => ({
    attributes: { exclude: ['deletedAt'] },
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
        model: sequelize.models.merchant.scope('id'),
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
  }))
  agent.addScope('trxManager', (acquirerId) => ({
    include: [
      {
        model: sequelize.models.merchant,
        include: [
          {
            where: acquirerId ? { id: acquirerId } : undefined,
            required: false,
            model: sequelize.models.acquirer.scope(
              'acquirerType',
              'acquirerConfig',
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
              model: sequelize.models.acquirer.scope(
                { method: ['agentExclusion', '`agent`.`id`'] }
              ),
              required: false,
              include: [
                sequelize.models.acquirerType
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
