'use strict'

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Sequelize.Op

  const merchant = sequelize.define('merchant', {
    idAlias: DataTypes.CHAR(25),

    name: DataTypes.STRING,
    shortName: DataTypes.CHAR(25),
    description: DataTypes.STRING,

    status: DataTypes.CHAR(32),

    companyForm: DataTypes.STRING,

    email: DataTypes.STRING,
    website: DataTypes.STRING,
    streetAddress: DataTypes.STRING,
    locality: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,

    taxCardNumber: DataTypes.STRING,
    scannedTaxCardResourceId: DataTypes.CHAR(27),

    bankName: DataTypes.STRING,
    bankBranchName: DataTypes.STRING,
    bankAccountName: DataTypes.STRING,
    bankAccountNumber: DataTypes.STRING,

    scannedBankStatementResourceId: DataTypes.CHAR(27),
    scannedSkmenkumhamResourceId: DataTypes.CHAR(27),
    scannedSiupResourceId: DataTypes.CHAR(27),
    scannedTdpResourceId: DataTypes.CHAR(27),
    scannedSkdpResourceId: DataTypes.CHAR(27),

    ownerName: DataTypes.STRING,
    ownerOccupation: DataTypes.STRING,
    ownerEmail: DataTypes.STRING,
    ownerPhoneNumber: DataTypes.STRING,
    ownerIdCardNumber: DataTypes.STRING,
    ownerIdCardType: DataTypes.STRING,
    ownerTaxCardNumber: DataTypes.STRING,

    ownerScannedIdCardResourceId: DataTypes.CHAR(27),
    ownerScannedTaxCardResourceId: DataTypes.CHAR(27),

    partnerId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  merchant.associate = (models) => {
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedTaxCardResourceId',
      as: 'scannedTaxCardResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedBankStatementResourceId',
      as: 'scannedBankStatementResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedSkmenkumhamResourceId',
      as: 'scannedSkmenkumhamResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedSiupResourceId',
      as: 'scannedSiupResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedTdpResourceId',
      as: 'scannedTdpResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'scannedSkdpResourceId',
      as: 'scannedSkdpResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'ownerScannedIdCardResourceId',
      as: 'ownerScannedIdCardResource'
    })
    merchant.belongsTo(models.resource, {
      foreignKey: 'ownerScannedTaxCardResourceId',
      as: 'ownerScannedTaxCardResource'
    })

    merchant.belongsTo(models.partner, { foreignKey: 'partnerId' })
    merchant.hasMany(models.outlet, { foreignKey: 'merchantId' })
    merchant.hasMany(models.acquirer, { foreignKey: 'merchantId' })
    merchant.hasMany(models.acquirerConfig, { foreignKey: 'merchantId' })
    merchant.hasMany(models.terminal, { foreignKey: 'merchantId' })

    merchant.belongsToMany(
      models.acquirerType,
      {
        through: 'merchantAcquirerType',
        foreignKey: 'merchantId',
        otherKey: 'acquirerTypeId'
      }
    )
  }

  merchant.addScope('excludeLegal', {
    attributes: {
      exclude: [
        'taxCardNumber',
        'scannedTaxCardResourceId',
        'scannedBankStatementResourceId',
        'scannedSkmenkumhamResourceId',
        'scannedSiupResourceId',
        'scannedTdpResourceId',
        'scannedSkdpResourceId',
        'ownerIdCardNumber',
        'ownerIdCardType',
        'ownerTaxCardNumber',
        'ownerScannedIdCardResourceId',
        'ownerScannedTaxCardResourceId'
      ]
    }
  })
  merchant.addScope('excludeBank', {
    attributes: {
      exclude: [
        'bankName',
        'bankBranchName',
        'bankAccountName',
        'bankAccountNumber'
      ]
    }
  })
  merchant.addScope('excludePartner', {
    attributes: {
      exclude: [
        'partnerId'
      ]
    }
  })
  merchant.addScope('acquirerConfig', {
    include: [
      {
        model: sequelize.models.acquirerConfig,
        on: {
          [Op.or]: [
            { merchantId: null },
            { merchantId: { [Op.eq]: sequelize.col('merchant.id') } }
          ]
        }
      }
    ]
  })

  merchant.addScope('partner', (partnerId) => ({
    where: {
      partnerId
    }
  }))

  merchant.addScope('admin', () => ({
    paranoid: false,
    include: [
      {
        model: sequelize.models.resource,
        as: 'scannedTaxCardResource'
      },
      {
        model: sequelize.models.resource,
        as: 'scannedBankStatementResource'
      },
      {
        model: sequelize.models.resource,
        as: 'scannedSkmenkumhamResource'
      },
      {
        model: sequelize.models.resource,
        as: 'scannedSiupResource'
      },
      {
        model: sequelize.models.resource,
        as: 'scannedTdpResource'
      },
      {
        model: sequelize.models.resource,
        as: 'scannedSkdpResource'
      },
      {
        model: sequelize.models.resource,
        as: 'ownerScannedIdCardResource'
      },
      {
        model: sequelize.models.resource,
        as: 'ownerScannedTaxCardResource'
      }
    ]
  }))

  merchant.createWithResources = async (value, options) => {
    const resources = Array(8)
    for (let i = 0; i < resources.length; i++) {
      resources[i] = sequelize.models.resource.buildWithId()
      await resources[i].save(options)
    }

    const merchantInstance = merchant.build(value, options)
    merchantInstance.scannedTaxCardResourceId = resources[0].id
    merchantInstance.scannedBankStatementResourceId = resources[1].id
    merchantInstance.scannedSkmenkumhamResourceId = resources[2].id
    merchantInstance.scannedSiupResourceId = resources[3].id
    merchantInstance.scannedTdpResourceId = resources[4].id
    merchantInstance.scannedSkdpResourceId = resources[5].id
    merchantInstance.ownerScannedIdCardResourceId = resources[6].id
    merchantInstance.ownerScannedTaxCardResourceId = resources[7].id

    await merchantInstance.save(options)
    return merchantInstance
  }

  return merchant
}
