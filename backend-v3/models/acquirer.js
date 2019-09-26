'use strict'

const query = require('./helpers/query')

module.exports = (sequelize, DataTypes) => {
  const Sequelize = sequelize.Sequelize
  const Op = Sequelize.Op

  const acquirer = sequelize.define('acquirer', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    minimumAmount: DataTypes.DECIMAL(28, 2),
    maximumAmount: DataTypes.DECIMAL(28, 2),

    processFee: DataTypes.DECIMAL(28, 2),
    shareAcquirer: DataTypes.DECIMAL(5, 4),
    shareMerchant: DataTypes.DECIMAL(5, 4),
    shareMerchantWithPartner: DataTypes.DECIMAL(5, 4),
    sharePartner: DataTypes.DECIMAL(5, 4),

    directSettlement: DataTypes.BOOLEAN,

    gateway: DataTypes.BOOLEAN,
    hidden: DataTypes.BOOLEAN,

    merchantId: DataTypes.INTEGER,
    acquirerCompanyId: DataTypes.INTEGER,

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
    acquirer.belongsTo(models.acquirerCompany, { foreignKey: 'acquirerCompanyId' })
    acquirer.belongsTo(models.acquirerConfig, { foreignKey: 'acquirerConfigId' })
    acquirer.belongsTo(models.acquirerType, { foreignKey: 'acquirerTypeId' })

    acquirer.hasMany(models.transaction, { foreignKey: 'acquirerId' })
  }

  acquirer.addScope('excludeShare', {
    attributes: {
      exclude: [
        'processFee',
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
          query.get('sub/getAcquirerExclusionByAgent.sql', [agentId])
        )
      }
    }
  }))

  acquirer.addScope('admin', () => ({
    paranoid: false,
    include: [
      sequelize.models.acquirerConfig.scope('paranoid'),
      sequelize.models.acquirerType.scope('paranoid'),
      sequelize.models.merchant.scope('id', 'name', 'paranoid'),
      sequelize.models.acquirerCompany.scope('paranoid')
    ]
  }))

  return acquirer
}
