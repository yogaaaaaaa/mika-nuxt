'use strict'

module.exports = (sequelize, DataTypes) => {
  let admin = sequelize.define('admin', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    email: DataTypes.STRING,

    userId: DataTypes.INTEGER
  }, {
    timestamps: true,
    freezeTableName: true,
    deletedAt: 'archivedAt',
    paranoid: true
  })

  admin.addScope('admin', () => ({
    include: [
      sequelize.models.user.scope('excludePassword')
    ]
  }))

  admin.associate = (models) => {
    admin.belongsTo(models.user, { foreignKey: 'userId' })
  }

  return admin
}
