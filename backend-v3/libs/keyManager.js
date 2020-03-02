'use strict'

const fs = require('fs')
const util = require('util')
const moment = require('moment')
const debug = require('debug')('mika:keyManager')
const Events = require('events')
const redis = require('libs/redis')
const jsonFile = require('libs/jsonFile')
const cipherbox = require('libs/cipherbox')
const twoManKeyBox = require('libs/twoManKeyBox')

const rename = util.promisify(fs.rename)

const dir = require('libs/dir')
const keyManagerConfig = require('configs/keyManagerConfig')

function redisKey (...keys) {
  return `key-manager:${keys.reduce((acc, key) => `${acc}:${key}`)}`
}

const keyManagerSessions = {
  IDLE: 'idle',
  UNLOCK: 'unlock',
  CREATE: 'create'
}

class KeyManager extends Events {
  constructor (options) {
    super()
    const {
      defaultKeyFile,
      isKeyMaster,
      sessionDurationSecond,
      keyCustodianCount,
      keyCustodianUnlockCount
    } = options

    this._defaultKeyFile = defaultKeyFile
    this._defaultKeyFilePath = dir.getKeyDirPath(this._defaultKeyFile)

    this._isKeyMaster = isKeyMaster || false
    this._dekRedisKey = redisKey('dek')

    this._keyCustodianCount = keyCustodianCount
    this._keyCustodianUnlockCount = keyCustodianUnlockCount

    this._session = keyManagerSessions.IDLE
    this._sessionDuration = Math.round(sessionDurationSecond * 1000)
    this._sessionTime = 0
    this._sessionTimer = undefined
    this._sessionTimeResolution = 1000
    this._sessionEndCallback = undefined
    this._sessionState = undefined
  }

  static get sessions () {
    return keyManagerSessions
  }

  _startSession (session, sessionEndCallback) {
    this._session = session
    this._sessionEndCallback = sessionEndCallback

    this._sessionTimer = setInterval(() => {
      this._sessionTime += this._sessionTimeResolution
      this.emit('sessionTick', this.getSessionTimeLeft())
      if (this._sessionTime >= this._sessionDuration) {
        this._endSession(undefined, 'timeout')
      }
    }, this._sessionTimeResolution)

    debug(`session ${this._session} start`)
    this.emit('sessionStart', this._session)
  }

  _stopSessionTimer () {
    clearInterval(this._sessionTimer)
    this._sessionTime = 0
  }

  _endSession (data, endReason = undefined) {
    this._stopSessionTimer()

    if (endReason === 'timeout') debug(`session ${this._session} is timeout`)
    if (endReason === 'force') debug(`session ${this._session} is forced to an end`)

    if (typeof this._sessionEndCallback === 'function') this._sessionEndCallback()
    this.emit('sessionEnd', data, endReason, this._session)

    debug(`session ${this._session} end`)

    this._session = keyManagerSessions.IDLE
    this._sessionState = undefined
    this._sessionEndCallback = undefined
  }

  _commonStart (session, sessionState) {
    if (this.isSessionIdle()) {
      this._sessionState = {
        passwords: [],
        isBusy: false,
        ...sessionState
      }
      this._startSession(session)
      return true
    }
  }

  async _handleCreate () {
    if (this._sessionState.passwords.length !== this._keyCustodianCount) return

    this._sessionState.isBusy = true
    this._stopSessionTimer()

    const keyBox = await cipherbox.generateCb0Key()
    const encryptedKeyBox = await twoManKeyBox.create(
      this._sessionState.passwords,
      keyBox
    )

    if (encryptedKeyBox) {
      try {
        const newFilePath = dir.getKeyDirPath(`${moment().unix()}-${this._defaultKeyFile}`)
        await rename(this._defaultKeyFilePath, newFilePath)
      } catch (err) {}
      await jsonFile.save(this._defaultKeyFilePath, encryptedKeyBox)
    }

    this._endSession(encryptedKeyBox)
  }

  async _handleUnlock () {
    if (this._sessionState.passwords.length !== this._keyCustodianUnlockCount) return

    this._sessionState.isBusy = true
    this._stopSessionTimer()
    const keyBox = await twoManKeyBox.open(
      this._sessionState.encryptedKeyBox,
      this._sessionState.passwords
    )
    if (keyBox) await this.setKey(keyBox)

    this._endSession(keyBox)
  }

  getSessionTimeLeft () {
    if (!this.isSessionIdle()) {
      const timeLeft =
        Math.round((this._sessionDuration - this._sessionTime) / this._sessionTimeResolution)

      if (timeLeft < 0) return 0
      return timeLeft
    }
  }

  isSessionIdle () {
    return this._session === keyManagerSessions.IDLE
  }

  forceIdleSession () {
    if (!this.isSessionIdle()) {
      this._endSession(undefined, 'force')
      return true
    }
  }

  isSessionCreate () {
    return this._session === keyManagerSessions.CREATE
  }

  startCreate () {
    return this._commonStart(keyManagerSessions.CREATE)
  }

  async pushCreatePassword (password) {
    if (this.isSessionCreate() && !this._sessionState.isBusy) {
      this._sessionState.passwords.push(password)
      this.emit('passwordAdd', this._sessionState.passwords.length)

      await this._handleCreate()

      return true
    }
  }

  isSessionUnlock () {
    return this._session === keyManagerSessions.UNLOCK
  }

  async startUnlock () {
    try {
      this._commonStart(keyManagerSessions.UNLOCK, {
        encryptedKeyBox: await this.loadKeyFile()
      })
    } catch (err) {
      return
    }
    return true
  }

  async pushUnlockPassword (password) {
    if (this.isSessionUnlock() && !this._sessionState.isBusy) {
      this._sessionState.passwords.push(password)
      this.emit('passwordAdd', this._sessionState.passwords.length)

      await this._handleUnlock()

      return true
    }
  }

  async loadKeyFile () {
    return jsonFile.load(this._defaultKeyFilePath)
  }

  async setKey (keyBox) {
    await redis.set(this._dekRedisKey, JSON.stringify(keyBox))
  }

  async getKey () {
    return JSON.parse(await redis.get(this._dekRedisKey))
  }
}

module.exports = new KeyManager({
  ...keyManagerConfig
})
