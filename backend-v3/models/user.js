'use strict'

module.exports = (sequelize, DataTypes) => {
  let user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,

    userType: DataTypes.CHAR(32),
    userRoles: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })

  user.associate = (models) => {
    user.addScope('noPassword', {
      attributes: { exclude: ['password'] }
    })
  }

  return user
}
