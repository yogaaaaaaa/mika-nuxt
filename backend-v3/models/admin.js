'use strict'

module.exports = (sequelize, DataTypes) => {
  let admin = sequelize.define('admin', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,

    email: DataTypes.STRING,

    userId: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    paranoid: true
  })
  admin.associate = (models) => {
    admin.belongsTo(models.user, { foreignKey: 'userId' })
  }
  return admin
}
