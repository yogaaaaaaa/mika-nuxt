'use strict'

module.exports = (sequelize, DataTypes) => {
  let outlet = sequelize.define('outlet', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

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
    restStartDate: DataTypes.DATE,
    restDurationMonth: DataTypes.INTEGER,

    otherPaymentSystems: DataTypes.STRING,

    outletPhotoResourceId: DataTypes.INTEGER,
    cashierDeskPhotoResourceId: DataTypes.INTEGER,

    businessType: DataTypes.STRING,
    businessDurationMonth: DataTypes.INTEGER,
    businessMonthlyTurnover: DataTypes.INTEGER,

    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
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
  }
  return outlet
}
