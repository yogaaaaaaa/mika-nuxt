'use strict'

const hash = require('../libs/hash')

module.exports = (sequelize, DataTypes) => {
  let user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,

    secure: DataTypes.BOOLEAN,

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
        } else if (typeof val === 'string') {
          this.setDataValue('userRoles', val)
        }
      }
    }
  }, {
    timestamps: true,
    freezeTableName: true,
    paranoid: false,
    hooks: {
      async beforeSave (user) {
        if (user.password) {
          user.password = await hash.bcryptHash(user.password)
        }
      }
    }
  })

  user.prototype.checkPassword = async function (password) {
    return hash.compareBcryptHash(this.getDataValue('password'), password)
  }

  user.addScope('excludePassword', {
    attributes: { exclude: ['password'] }
  })

  user.associate = (models) => {
  }

  return user
}
