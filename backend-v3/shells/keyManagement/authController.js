'use strict'

const Event = require('events')
const auth = require('libs/auth')

class AuthController extends Event {
  constructor () {
    super()

    this._sessionRefreshTime = Math.round(auth.authExpirySecond / 2) * 1000

    this._sessionToken = undefined
    this._authSuccessListener = undefined
    this._sessionRefreshInterval = undefined

    this._currentAction = undefined

    this.auth = undefined
  }

  async _handleAuthSuccess (auth) {
    if (this.auth.userId === auth.userId) {
      await this.logout()
      this.emit('authOverride')
    }
  }

  _turnOnAuthListener () {
    if (!this._authSuccessListener) {
      this._authSuccessListener = async (...args) => {
        await this._handleAuthSuccess(...args)
      }
      auth.event.on(auth.eventTypes.AUTH_SUCCESS, this._authSuccessListener)
    }
  }

  _turnOffAuthListener () {
    if (this._authSuccessListener) {
      auth.event.off(auth.eventTypes.AUTH_SUCCESS, this._authSuccessListener)
      this._authSuccessListener = undefined
    }
  }

  _turnOnSessionRefresh () {
    this._sessionRefreshInterval = setInterval(
      this._checkSession,
      this._sessionRefreshTime
    )
  }

  _turnOffSessionRefresh () {
    clearInterval(this._sessionRefreshInterval)
  }

  async _checkSession () {
    if (this._sessionToken) {
      return auth.checkAuth(this._sessionToken)
    }
  }

  async login (username, password) {
    const authResult = await auth.doAuth(username, password)
    if (authResult) {
      this._turnOnAuthListener()
      this._turnOnSessionRefresh()

      this._sessionToken = authResult.sessionToken
      this.auth = authResult.auth

      return true
    }
  }

  async logout () {
    this._turnOffAuthListener()
    this._turnOffSessionRefresh()

    if (await this._checkSession()) {
      await auth.removeAuth(this._sessionToken)
    }

    this._sessionToken = undefined
    this.auth = undefined
  }

  async checkPassword (password) {
    if (this._sessionToken) {
      return auth.checkPassword(this.auth.userId, password)
    }
  }
}

module.exports = {
  use (ctx) {
    ctx.authCtl = new AuthController()
  },
  useEnd (ctx) {
    ctx.authCtl.logout()
  }
}
