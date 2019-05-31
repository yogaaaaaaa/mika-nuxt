'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

const script = require('../libs/script')

module.exports = (sequelize, DataTypes) => {
  let acquirer = sequelize.define('acquirer', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    minimumAmount: DataTypes.DECIMAL(28, 2),
    maximumAmount: DataTypes.DECIMAL(28, 2),

    shareAcquirer: DataTypes.DECIMAL(5, 4),
    shareMerchant: DataTypes.DECIMAL(5, 4),
    shareMerchantWithPartner: DataTypes.DECIMAL(5, 4),
    sharePartner: DataTypes.DECIMAL(5, 4),

    directSettlement: DataTypes.BOOLEAN,

    gateway: DataTypes.BOOLEAN,
    hidden: DataTypes.BOOLEAN,

    merchantId: DataTypes.INTEGER,
    acquirerConfigId: DataTypes.INTEGER,
    acquirerTypeId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  acquirer.associate = (models) => {
    acquirer.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    acquirer.belongsTo(models.acquirerConfig, { foreignKey: 'acquirerConfigId' })
    acquirer.belongsTo(models.acquirerType, { foreignKey: 'acquirerTypeId' })

    acquirer.hasMany(models.transaction, { foreignKey: 'acquirerId' })
  }

  acquirer.addScope('excludeShare', {
    attributes: {
      exclude: [
        'shareAcquirer',
        'shareMerchant',
        'shareMerchantWithPartner',
        'sharePartner',
        'directSettlement'
      ]
    }
  })
  acquirer.addScope('excludeExtra', {
    attributes: {
      exclude: [
        'minimumAmount',
        'maximumAmount',
        'gateway',
        'hidden'
      ]
    }
  })

  acquirer.addScope('acquirerType', () => ({
    include: [
      sequelize.models.acquirerType
    ]
  }))
  acquirer.addScope('acquirerConfig', () => ({
    include: [
      sequelize.models.acquirerConfig.scope('acquirerConfigKv')
    ]
  }))
  acquirer.addScope('agentExclusion', (agentId) => ({
    where: {
      id: {
        [Op.notIn]: Sequelize.literal(
          script.get('subquery/getAcquirerExclusionByAgent.sql', [ agentId ])
        )
      }
    }
  }))

  acquirer.addScope('admin', () => ({
    include: [
      sequelize.models.acquirerType
    ]
  }))

  return acquirer
}
