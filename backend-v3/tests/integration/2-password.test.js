'use strict'

/* global describe it before after */
/* eslint-disable no-unused-expressions */

const request = require('./helpers/request')
const auth = require('./helpers/auth')

const models = require('models')
const passwd = require('libs/passwd')

const baseUrl = process.env.BASE_URL || 'http://localhost:12000'

const userAgent = {
  username: 'agent2',
  password: 'agent2',
  type: 'agent'
}

function passwordTest ({
  baseUrl,
  userData
}) {
  describe(`Password tests with '${userData.username}' (${userData.type})`, function () {
    let user
    let _lastPasswords

    const password = passwd.standardPasswordGenerator.generate()
    const badPassword = 'hello'

    const newUserData = Object.assign({}, userData, { password })

    let sessionToken

    before(async function () {
      sessionToken = (await auth.login({ baseUrl, userData })).body.data.sessionToken

      user = await models.user.findOne({ where: { username: userData.username } })
      _lastPasswords = user.lastPasswords

      user.lastPasswords = []
      await user.save()
    })
    after(async function () {
      user.password = userData.password
      user.lastPasswords = _lastPasswords
      await user.save()
    })

    it('Self password check should be success with valid response', async function () {
      await auth.selfPasswordCheck({
        baseUrl,
        sessionToken,
        password: userData.password
      })
    })
    it('Change password with bad password should be failed with valid response', async function () {
      await auth.changePassword({
        baseUrl,
        sessionToken,
        oldPassword: userData.password,
        password: badPassword,
        shouldBe: 'badPassword'
      })
    })
    it('Change password with invalid old password should be failed with valid response', async function () {
      await auth.changePassword({
        baseUrl,
        sessionToken,
        oldPassword: `userData.password${'zxcv123490'}`,
        password: password,
        shouldBe: 'badOldPassword'
      })
    })
    it('Change password with good password should be success with valid response', async function () {
      await auth.changePassword({
        baseUrl,
        sessionToken,
        oldPassword: userData.password,
        password: newUserData.password
      })
      sessionToken = (await auth.login({ baseUrl, userData: newUserData })).body.data.sessionToken
      await auth.sessionCheck({ baseUrl, sessionToken })
    })
    it('Change password to same password should be failed with valid response', async function () {
      await auth.changePassword({
        baseUrl,
        sessionToken,
        oldPassword: newUserData.password,
        password: newUserData.password,
        shouldBe: 'passwordExist'
      })
    })
  })
}

describe('2 - Password related tests', function () {
  before(() => request.mikaCheck({ baseUrl }))
  passwordTest({ baseUrl, userData: userAgent })
})
