'use strict'

module.exports = (sequelize, DataTypes) => {
  const acquirerStaff = sequelize.define(
    'acquirerStaff',
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      email: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      acquirerCompanyId: DataTypes.INTEGER
    },
    {
      timestamps: true,
      freezeTableName: true,
      deletedAt: 'archivedAt',
      paranoid: true
    }
  )

  acquirerStaff.associate = function (models) {
    acquirerStaff.belongsTo(models.user, { foreignKey: 'userId' })
    acquirerStaff.belongsTo(models.acquirerCompany, {
      foreignKey: 'acquirerCompanyId'
    })
  }
  acquirerStaff.addScope('admin', () => ({
    paranoid: false,
    include: [
      sequelize.models.user.scope('excludePassword')
    ]
  }))

  acquirerStaff.addScope('acquirerStaff', () => ({
    attributes: { exclude: ['archivedAt'] },
    include: [
      sequelize.models.acquirerCompany.scope('excludeTimestamp')
    ]
  }))

  return acquirerStaff
}
