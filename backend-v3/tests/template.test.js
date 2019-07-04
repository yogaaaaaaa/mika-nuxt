/* global describe it before after */

'use strict'

const chai = require('chai')
const expect = chai.expect
chai.should()

describe('Template test : ', () => {
  before(() => {
  })
  after(() => {
  })

  it('1 + 1 Should be 2', (done) => {
    expect(1 + 1).to.equal(2)
    done()
  })

  it('name equal to "test"', (done) => {
    const name = 'test'
    expect(name).to.equal('test')
    done()
  })
})
