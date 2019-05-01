'use strict'

const hash = require('../helpers/hash')

module.exports = (sequelize, DataTypes) => {
  let user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,

    userType: DataTypes.CHAR(32),
    userRoles: {
      type: DataTypes.STRING,
      get () {
        let val = this.getDataValue('userRoles')
        if (typeof val === 'string') return val.split(',')
      },
      set (val) {
        if (Array.isArray(val)) {
          this.setDataValue('userRoles', val.join(','))
        } else {
          this.setDataValue('userRoles', '')
        }
      }
    }
  }, {
    freezeTableName: true,
    paranoid: true
  })

  user.addHook('beforeSave', async (user) => {
    user.password = await hash.bcryptHash(user.password)
  })

  user.prototype.checkPassword = async function (password) {
    return hash.compareBcryptHash(this.getDataValue('password'), password)
  }

  user.associate = (models) => {
    user.addScope('excludePassword', {
      attributes: { exclude: ['password'] }
    })
  }

  return user
}
