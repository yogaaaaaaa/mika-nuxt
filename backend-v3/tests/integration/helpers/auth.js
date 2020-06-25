'use strict'

/* eslint-disable no-unused-expressions */

const chai = require('chai')
const { expect } = chai
const request = require('./request')

module.exports.login = ({
  baseUrl,
  userData,
  loginPath = '/api/auth/login'
}) => {
  const loginRequest = request
    .mikaPostRequest({
      baseUrl,
      path: loginPath,
      body: userData
    })
    .expect(response => {
      const { body } = response

      expect(response.body.status).to.be.equal('auth-200')
      expect(response.body.isError).to.be.equal(false)

      expect(body.data).to.be.a('object')
      expect(body.data.username).to.be.a('string')
      expect(body.data.userType).to.be.a('string')
      if (body.data.userRoles) expect(body.data.userRoles).to.be.an('array')
      expect(body.data.sessionToken).to.be.a('string')
      expect(body.data.authExpirySecond).to.be.exist
      expect(body.data.sessionUserDek).to.be.a('string')
      expect(body.data.userDek).to.be.a('string')
      expect(body.data.publicDetails).to.be.a('object')
      expect(body.data.publicDetails.thumbnailsBaseUrl).to.be.a('string')

      expect(response.body.data.username).to.be.equal(userData.username)
    })
  if (userData.type === 'agent') {
    loginRequest
      .expect(response => {
        expect(response.body.data.userType).to.be.equal('agent')
        expect(response.body.data.agentId).to.be.exist
      })
  } else if (userData.type === 'admin') {
    loginRequest
      .expect(response => {
        expect(response.body.data.userType).to.be.equal('admin')
        expect(response.body.data.adminId).to.be.exist
      })
  }

  return loginRequest
}

module.exports.logout = ({
  baseUrl,
  sessionToken,
  userData,
  logoutPath = '/api/auth/logout'
}) => {
  return request
    .mikaPostRequest({
      baseUrl,
      sessionToken,
      path: logoutPath
    })
    .expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-201')
      expect(response.body.isError)
        .to.be.equal(false)
    })
}

module.exports.sessionCheck = ({
  baseUrl,
  sessionToken,
  shouldValid = true,
  checkPath = '/api/auth/check',
  userData
}) => {
  const sessionCheckRequest = request
    .mikaPostRequest({
      baseUrl,
      body: { sessionToken },
      path: checkPath
    })

  if (shouldValid) {
    return sessionCheckRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-202')
      expect(response.body.isError)
        .to.be.equal(false)
    })
  } else {
    return sessionCheckRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-404')
      expect(response.body.isError)
        .to.be.equal(true)
    })
  }
}

module.exports.changePassword = ({
  baseUrl,
  oldPassword,
  password,
  sessionToken,
  shouldBe = 'success'
}) => {
  const changePasswordRequest = request
    .mikaPostRequest({
      baseUrl,
      sessionToken,
      body: {
        oldPassword,
        password
      },
      path: '/api/auth/change_password'
    })

  if (shouldBe === 'badPassword') {
    return changePasswordRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('sys-401')
      expect(response.body.isError)
        .to.be.equal(true)
    })
  } else if (shouldBe === 'badOldPassword') {
    return changePasswordRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-410')
      expect(response.body.isError)
        .to.be.equal(true)
    })
  } else if (shouldBe === 'passwordExist') {
    return changePasswordRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-412')
      expect(response.body.isError)
        .to.be.equal(true)
    })
  } else {
    return changePasswordRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-203')
      expect(response.body.isError)
        .to.be.equal(false)
    })
  }
}

module.exports.selfPasswordCheck = ({
  baseUrl,
  password,
  sessionToken,
  shouldValid = true
}) => {
  const selfPasswordCheckRequest = request
    .mikaPostRequest({
      baseUrl,
      sessionToken,
      body: {
        password
      },
      path: '/api/auth/self_password_check'
    })

  if (shouldValid) {
    return selfPasswordCheckRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('sys-200')
      expect(response.body.isError)
        .to.be.equal(false)
    })
  } else {
    return selfPasswordCheckRequest.expect(response => {
      expect(response.body.status)
        .to.be.equal('auth-450')
      expect(response.body.isError)
        .to.be.equal(true)
    })
  }
}
