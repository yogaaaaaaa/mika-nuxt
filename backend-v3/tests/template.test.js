'use strict'

/* global describe it before after */
/* eslint-disable no-unused-expressions */

const request = require('supertest')
const chai = require('chai')
const { expect } = chai

describe('Template test', function () {
  before(function () {
  })
  after(function () {
  })

  it('name equal to "test"', function () {
    const name = 'test'
    expect(name).to.equal('test')
    return Promise.resolve()
  })

  it('1 + 1 Should be 2', function (done) {
    expect(1 + 1).to.equal(2)
    done()
  })

  it('POST https://postman-echo.com/post, should return 200 with correct response', function () {
    this.timeout(10000)
    return request('https://postman-echo.com/post')
      .post('/')
      .send({
        message: 'Hello World'
      })
      .expect('content-type', /json/)
      .expect(200)
      .expect(response => {
        const { body } = response
        expect(body).is.a('object')
        expect(body.data).is.a('object')
        expect(body.data.message).is.not.empty
        expect(body.data.message).is.equal('Hello World')
      })
  })
})
