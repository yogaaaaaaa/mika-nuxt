'use strict'

const moment = require('moment')
const hash = require('../libs/hash')

const commonConfig = require('../configs/commonConfig')

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,

    secure: DataTypes.BOOLEAN,

    followPasswordExpiry: DataTypes.BOOLEAN,
    followFailedLoginLockout: DataTypes.BOOLEAN,

    lastPasswords: {
      type: DataTypes.STRING(1024),
      get () {
        const val = this.getDataValue('lastPasswords')
        if (typeof val === 'string') return val.split(',')
      },
      set (val) {
        if (Array.isArray(val)) {
          this.setDataValue('lastPasswords', val.join(','))
        } else if (typeof val === 'string') {
          this.setDataValue('lastPasswords', val)
        }
      }
    },

    lastLoginAttemptAt: DataTypes.DATE,
    lastPasswordChangeAt: DataTypes.DATE,
    failedLoginAttempt: DataTypes.INTEGER,

    userType: DataTypes.STRING(32),
    userRoles: {
      type: DataTypes.STRING,
      get () {
        const val = this.getDataValue('userRoles')
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
        if (user.changed('password')) {
          const lastPasswordsCount = commonConfig.authLastPasswordsCount

          const previousPassword = user.previous('password')
          const hashedPassword = await hash.bcryptHash(user.password)
          let lastPasswords = user.lastPasswords

          if (Array.isArray(lastPasswords)) {
            lastPasswords.push(hashedPassword)
            while (lastPasswords.length >= lastPasswordsCount) lastPasswords.shift()
          } else if (previousPassword) {
            lastPasswords = [previousPassword, hashedPassword]
          } else {
            lastPasswords = [hashedPassword]
          }

          user.password = hashedPassword
          user.lastPasswords = lastPasswords
        }
      }
    }
  })

  user.prototype.checkPassword = async function (password) {
    return hash.compareBcryptHash(this.getDataValue('password'), password)
  }

  user.prototype.checkFailedLoginAttempt = function () {
    if (!this.followFailedLoginLockout) return

    const maxAttempt = parseInt(commonConfig.authMaxFailedLoginAttempt)
    const lockSecond = commonConfig.authLockSecond
    const endLockoutMoment = this.lastLoginAttemptAt ? moment(this.lastLoginAttemptAt).add(lockSecond, 'second') : undefined

    if (this.failedLoginAttempt >= maxAttempt) {
      if (!endLockoutMoment) return true
      if (moment().isBefore(endLockoutMoment)) return true

      this.failedLoginAttempt = 0
    }
  }

  user.prototype.setLastLoginAttemptAt = function () {
    this.lastLoginAttemptAt = moment().toDate()
  }

  user.prototype.setLastPasswordChangeAt = function () {
    this.lastPasswordChangeAt = moment().toDate()
  }

  user.prototype.getPasswordExpiryMoment = function () {
    if (!this.lastPasswordChangeAt) return
    const passwordAgeSecond = commonConfig.authPasswordAgeSecond
    return moment(this.lastPasswordChangeAt).add(passwordAgeSecond, 'second')
  }

  user.prototype.isPasswordExpired = function () {
    if (!this.followPasswordExpiry) return

    const expiryMoment = this.getPasswordExpiryMoment()
    if (!expiryMoment) return
    if (moment().isAfter(expiryMoment)) return true
  }

  user.prototype.isIncludedInLastPasswords = async function (newPassword) {
    const lastPasswords = this.lastPasswords || []
    const previousPassword = this.previous('password')
    const password = this.password

    if (previousPassword) lastPasswords.push(previousPassword)
    if (password) lastPasswords.push(password)

    for (const lastPassword of lastPasswords) {
      if (await hash.compareBcryptHash(lastPassword, newPassword)) return true
    }
  }

  user.prototype.saveFailedLogin = async function (saveOptions) {
    this.setLastLoginAttemptAt()
    this.failedLoginAttempt++
    return this.save(saveOptions)
  }

  user.prototype.saveSuccessLogin = async function (saveOptions) {
    this.setLastLoginAttemptAt()
    this.failedLoginAttempt = 0
    return this.save(saveOptions)
  }

  user.prototype.expirePassword = function () {
    this.lastPasswordChangeAt = null
  }

  user.prototype.unExpirePassword = function () {
    this.lastPasswordChangeAt = new Date()
  }

  user.prototype.lockout = function () {
    this.lastLoginAttemptAt = new Date()
    this.failedLoginAttempt = parseInt(parseInt(commonConfig.authMaxFailedLoginAttempt))
  }

  user.prototype.unLockout = function () {
    this.lastLoginAttemptAt = new Date()
    this.failedLoginAttempt = 0
  }

  user.addScope('excludePassword', {
    attributes: { exclude: ['password', 'lastPasswords'] }
  })

  user.associate = (models) => {
  }

  return user
}
