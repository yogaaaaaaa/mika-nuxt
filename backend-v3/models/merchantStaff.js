'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantStaff = sequelize.define('merchantStaff', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    idCardNumber: DataTypes.STRING,
    idCardType: DataTypes.STRING,
    email: DataTypes.STRING,
    occupation: DataTypes.STRING,

    locationLong: DataTypes.STRING,
    locationLat: DataTypes.STRING,
    streetAddress: DataTypes.STRING,
    locality: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,

    userId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })

  merchantStaff.addScope('merchantStaff', () => ({
    attributes: { exclude: ['deletedAt'] },
    include: [
      sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank', 'excludePartner')
    ]
  }))

  merchantStaff.associate = function (models) {
    merchantStaff.belongsTo(models.user, { foreignKey: 'userId' })
    merchantStaff.belongsTo(models.merchant, { foreignKey: 'merchantId' })

    merchantStaff.belongsToMany(
      models.outlet,
      {
        through: 'outletMerchantStaff',
        foreignKey: 'merchantStaffId',
        otherKey: 'outletId'
      }
    )
  }

  return merchantStaff
}
