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
    paranoid: true
  })

  admin.associate = (models) => {
    admin.belongsTo(models.user, { foreignKey: 'userId' })

    admin.addScope('admin', () => ({
      include: [ models.user.scope('excludePassword') ]
    }))
  }

  return admin
}
