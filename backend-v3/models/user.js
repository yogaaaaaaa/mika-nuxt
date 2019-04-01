'use strict'

module.exports = (sequelize, DataTypes) => {
  let user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    userType: DataTypes.STRING
  }, {
    freezeTableName: true,
    paranoid: true
  })
  user.associate = (models) => {}
  return user
}
