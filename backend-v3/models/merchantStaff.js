'use strict'

module.exports = (sequelize, DataTypes) => {
  const merchantStaff = sequelize.define('merchantStaff', {
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
      sequelize.models.merchant.scope('excludeTimestamp', 'excludeLegal', 'excludeBank')
    ]
  }))
  merchantStaff.addScope('merchantStaffAcquirer', (acquirerId) => ({
    attributes: ['id'],
    include: [
      {
        model: sequelize.models.merchant.scope('id'),
        paranoid: false,
        required: true,
        include: [
          {
            model: sequelize.models.acquirer.scope('excludeShare'),
            paranoid: false,
            where: acquirerId ? { id: acquirerId } : undefined,
            include: [
              {
                model: sequelize.models.acquirerType,
                paranoid: false
              },
              {
                model: sequelize.models.acquirerConfig.scope('excludeConfig'),
                paranoid: false
              }
            ]
          }
        ]
      }
    ]
  }))
  merchantStaff.addScope('admin', () => ({
    paranoid: false,
    include: [
      sequelize.models.user.scope('excludePassword')
    ]
  }))

  return merchantStaff
}
