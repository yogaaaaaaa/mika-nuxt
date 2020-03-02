'use strict'

const debug = require('debug')('mika:ftie')
const _ = require('lodash')
const superagent = require('superagent')

module.exports.responseCodes = {
  SUCCESS: '00',
  ERROR: '01',
  HOST_TIMEOUT: '10'
}

module.exports.request = async (url, body, retry = 1) => {
  // clean body from null and undefined
  body = _.pickBy(body, (val) => (val !== null && val !== undefined))

  try {
    while (retry) {
      debug('url:', url)
      debug('request:', JSON.stringify(body, null, 2))
      const response = await superagent
        .post(url)
        .set('Content-type', 'application/json')
        .set('Accept', 'application/json')
        .set('User-Agent', 'MIKA API')
        .send(body)
      debug('response:', JSON.stringify(response.body, null, 2))

      if (
        response &&
        response.body &&
        response.body.Meta.Status === exports.responseCodes.SUCCESS
      ) {
        return response.body
      }
      retry--
    }
  } catch (err) {
    if (err.response && err.response.body) {
      debug('error:', JSON.stringify(err.response.body, null, 2))
    }
    throw err
  }
}
