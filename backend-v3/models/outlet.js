'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

const script = require('../libs/script')

module.exports = (sequelize, DataTypes) => {
  let outlet = sequelize.define('outlet', {
    idAlias: DataTypes.CHAR(25),

    name: DataTypes.STRING,
    description: DataTypes.STRING,

    status: DataTypes.CHAR(32),

    email: DataTypes.STRING,
    website: DataTypes.STRING,
    locationLong: DataTypes.DECIMAL(12, 8),
    locationLat: DataTypes.DECIMAL(12, 8),
    streetAddress: DataTypes.STRING,
    locality: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,

    ownershipType: DataTypes.STRING,
    rentStartDate: DataTypes.DATE,
    rentDurationMonth: DataTypes.INTEGER,

    otherPaymentSystems: DataTypes.STRING,

    outletPhotoResourceId: DataTypes.CHAR(27),
    cashierDeskPhotoResourceId: DataTypes.CHAR(27),

    businessType: DataTypes.STRING,
    businessDurationMonth: DataTypes.INTEGER,
    businessMonthlyTurnover: DataTypes.INTEGER,

    merchantId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  outlet.addScope('excludeBusiness', {
    attributes: { exclude: [
      'ownershipType',
      'rentStartDate',
      'rentDurationMonth',
      'otherPaymentSystems',
      'outletPhotoResourceId',
      'cashierDeskPhotoResourceId',
      'businessDurationMonth',
      'businessMonthlyTurnover'
    ] }
  })
  outlet.addScope('excludeMerchant', {
    attributes: { exclude: [
      'merchantId'
    ] }
  })
  outlet.addScope('merchantStaff', (merchantStaffId) => ({
    attributes: {
      exclude: ['archivedAt']
    },
    where: {
      [Op.and]: [
        {
          id: {
            [Op.in]: Sequelize.literal(
              script.get('subquery/getOutletByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
            )
          }
        }
      ]
    }
  }))
  outlet.addScope('admin', (merchantStaffId, excludeByMerchantStaffId) => {
    let scope = {
      where: {
        [Op.and]: []
      },
      include: [
        {
          model: sequelize.models.resource,
          as: 'outletPhotoResource'
        },
        {
          model: sequelize.models.resource,
          as: 'cashierDeskPhotoResource'
        }
      ]
    }

    if (merchantStaffId) {
      scope.where[Op.and].push({
        id: {
          [excludeByMerchantStaffId ? Op.notIn : Op.in]: Sequelize.literal(
            script.get('subquery/getOutletByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
          )
        }
      })
      scope.where[Op.and].push({
        merchantId: {
          [Op.in]: Sequelize.literal(
            script.get('subquery/getMerchantByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
          )
        }
      })
    }

    return scope
  })

  outlet.associate = function (models) {
    outlet.belongsTo(models.resource, {
      foreignKey: 'outletPhotoResourceId',
      as: 'outletPhotoResource'
    })
    outlet.belongsTo(models.resource, {
      foreignKey: 'cashierDeskPhotoResourceId',
      as: 'cashierDeskPhotoResource'
    })
    outlet.belongsTo(models.merchant, { foreignKey: 'merchantId' })
    outlet.hasMany(models.terminal, { foreignKey: 'outletId' })
  }

  outlet.createWithResources = async (value, options) => {
    let resources = Array(2)
    for (let i = 0; i < resources.length; i++) {
      resources[i] = sequelize.models.resource.buildWithId()
      await resources[i].save(options)
    }

    let outletInstance = outlet.build(value, options)
    outletInstance.outletPhotoResourceId = resources[0].id
    outletInstance.cashierDeskPhotoResourceId = resources[1].id

    await outletInstance.save(options)
    return outletInstance
  }

  return outlet
}
