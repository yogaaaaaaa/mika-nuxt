'use strict'

/* global describe it before */
/* eslint-disable no-unused-expressions */

const request = require('./helpers/request')
const auth = require('./helpers/auth')

const baseUrl = process.env.INTEGRATION_BASE_URL || 'http://localhost:12000'

const userAgent = {
  username: 'agent2',
  password: 'agent2',
  type: 'agent'
}

const userAdmin = {
  username: 'admin',
  password: 'admin',
  type: 'admin'
}

function basicAuthTest ({
  baseUrl,
  userData
}) {
  describe(`Basic authentication with '${userData.username}' (${userData.type})`, function () {
    let sessionToken

    it('Login should success with valid response', async function () {
      const { body } = await auth.login({
        baseUrl,
        userData
      })
      sessionToken = body.data.sessionToken
    })

    it('Session check should success with valid response', async function () {
      return auth.sessionCheck({
        baseUrl,
        sessionToken,
        shouldValid: true
      })
    })

    it('Re-login should invalidate old session token', async function () {
      const oldSessionToken = sessionToken
      const { body } = await auth.login({
        baseUrl,
        userData
      })
      sessionToken = body.data.sessionToken

      auth.sessionCheck({
        baseUrl,
        oldSessionToken,
        shouldValid: false
      })
    })

    it('Logout should success with valid response and session token cannot longer be used', async function () {
      await auth.logout({
        baseUrl,
        sessionToken
      })

      return auth.sessionCheck({
        baseUrl,
        sessionToken,
        shouldValid: false
      })
    })
  })
}

describe('1 - Basic authentication', function () {
  before(() => request.mikaCheck({ baseUrl }))

  basicAuthTest({ baseUrl, userData: userAdmin })
  basicAuthTest({ baseUrl, userData: userAgent })
})
