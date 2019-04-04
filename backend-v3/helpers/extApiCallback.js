'use strict'

/**
 * This module provide webhook/callback and its retry
 * for Public/External API
 */

const apiKeyAuth = require('./extApiKeyAuth')

const request = require('superagent')
require('superagent-retry-delay')(request)

module.exports.config = require('../config/extApiCallbackConfig')

module.exports.makeApiCallback = async (keyId, url, objectBody = {}, callback = () => {}) => {
  let bodyString = JSON.stringify(objectBody)
  let serverToken = await apiKeyAuth.createServerApiToken(keyId, bodyString)

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
    } catch (error) {}

    if (response) {
      if (response.status === 200) {
        callback(response)
        return
      }
    }

    if (retryLeft <= 0) {
      callback(response)
    } else {
      setTimeout(() => makeRequest(retryLeft - 1), exports.config.callBackDelay)
    }
  }
  makeRequest(exports.config.callBackRetryCount)
}
