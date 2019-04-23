'use strict'

/**
 * This module provide webhook/callback and its retry
 * for external API
 */

const request = require('superagent')
require('superagent-retry-delay')(request)

const extAuth = require('./extApiAuth')

const extApiConfig = require('../configs/extApiConfig')

module.exports.createCallback = async (idKey, url, body, callback = () => {}) => {
  let bodyString = JSON.stringify(body)
  let serverToken = await extAuth.createServerToken(idKey, bodyString)

  const makeRequest = async (retryLeft) => {
    let response = null
    try {
      response = await request
        .post(url)
        .set('Authentication', `Bearer ${serverToken}`)
        .set('Content-type', 'application/json')
        .set('User-Agent', 'MIKA API Callback')
        .retry(1, 1000)
        .send(bodyString)
    } catch (err) {
      console.error(err)
    }

    if (response) {
      if (response.status === 200) {
        callback(response)
        return
      }
    }

    if (retryLeft <= 0) {
      callback(response)
      return
    }

    setTimeout(() => makeRequest(retryLeft - 1), extApiConfig.callBackDelaySecond)
  }
  makeRequest(extApiConfig.callBackRetryCount)
}
