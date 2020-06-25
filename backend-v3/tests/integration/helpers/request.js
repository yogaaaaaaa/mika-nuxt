'use strict'

/* eslint-disable no-unused-expressions */

const { expect } = require('chai')
const supertest = require('supertest')

function standardResponse (response) {
  const { body } = response

  expect(body).to.be('object')

  expect(body.version).to.be.a('string')
  expect(body.version).to.be.not.empty

  expect(body.status).to.be.a('string')
  expect(body.status).to.be.not.empty

  expect(body.isError).to.be.a('boolean')

  expect(body.message).to.be.a('string')
}

function metaPaginationResponse (response) {
  const { body } = response

  expect(body.meta).to.be('object')
  expect(body.meta.page).to.be('number')
  expect(body.meta.ofPages).to.be('number')
  expect(body.meta.perPage).to.be('number')
  expect(body.meta.totalCount).to.be('number')
}

module.exports.mikaCheck = ({
  baseUrl
}) => {
  const request =
    supertest(baseUrl)
      .post('/api')
      .expect('content-Type', /json/)
      .expect(200)
      .expect(response => response.body.status === 'sys-200')

  return request
}

module.exports.mikaPostRequest = ({
  baseUrl,
  path = '/',
  sessionToken = '',
  body
}) => {
  const request =
    supertest(baseUrl)
      .post(path)
      .send(body)
      .set('x-access-token', sessionToken)
      .expect('content-Type', /json/)

  return request
}

module.exports.mikaGetRequest = ({
  baseUrl,
  path = '/',
  sessionToken = '',
  expectMetaPagination = false
}) => {
  const request =
    supertest(baseUrl)
      .get(path)
      .set('x-session-token', sessionToken)
      .expect('content-Type', /json/)
      .expect(standardResponse)

  if (expectMetaPagination) request.expect(metaPaginationResponse)

  return request
}
