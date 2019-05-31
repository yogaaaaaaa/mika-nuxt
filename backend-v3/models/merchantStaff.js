'use strict'

module.exports = (sequelize, DataTypes) => {
  let merchantStaff = sequelize.define('merchantStaff', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    idCardNumber: DataTypes.STRING,
    idCardType: DataTypes.STRING,
    email: DataTypes.STRING,
    occupation: DataTypes.STRING,

    locationLong: DataTypes.DECIMAL(12, 8),
    locationLat: DataTypes.DECIMAL(12, 8),
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
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  merchantStaff.associate = function (models) {
    merchantStaff.belongsTo(models.user, { foreignKey: 'userId' })
    merchantStaff.belongsTo(models.merchant, { foreignKey: 'merchantId' })

    merchantStaff.belongsToMany(
      models.outlet,
      {
        through: 'merchantStaffOutlet',
        foreignKey: 'merchantStaffId',
        otherKey: 'outletId'
      }
    )
  }

  merchantStaff.addScope('merchantStaff', () => ({
    attributes: { exclude: ['archivedAt'] },
    include: [
      sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank', 'excludePartner')
    ]
  }))
  merchantStaff.addScope('merchantStaffAcquirer', (acquirerId) => ({
    attributes: ['id'],
    include: [
      {
        model: sequelize.models.merchant.scope('id'),
        include: [
          {
            where: acquirerId ? { id: acquirerId } : undefined,
            model: sequelize.models.acquirer.scope(
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
  merchantStaff.addScope('admin', () => ({
    include: [
      sequelize.models.user.scope('excludePassword')
    ]
  }))

  return merchantStaff
}
