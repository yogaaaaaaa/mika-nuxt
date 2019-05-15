'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

const script = require('../helpers/script')

module.exports = (sequelize, DataTypes) => {
  let outlet = sequelize.define('outlet', {
    idAlias: DataTypes.CHAR(40),

    name: DataTypes.STRING,
    description: DataTypes.STRING,

    status: DataTypes.CHAR(32),

    email: DataTypes.STRING,
    website: DataTypes.STRING,
    locationLong: DataTypes.STRING,
    locationLat: DataTypes.STRING,
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
    freezeTableName: true,
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
      exclude: ['deletedAt']
    },
    where: {
      id: {
        [Op.in]: Sequelize.literal(
          script.get('subquery/getOutletByMerchantStaff.sql', [ parseInt(merchantStaffId) || null ])
        )
      }
    }
  }))

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

  return outlet
}
