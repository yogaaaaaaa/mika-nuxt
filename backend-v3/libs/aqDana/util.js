'use strict'

const config = require('configs/aqDanaConfig')
const {
  setPrivateKey,
  setPublicKey,
  createSign,
  verifySign
} = require('digital-signature')
const superagent = require('superagent')

/**
 * Generate Signature, required for dana server to be verified
 */
module.exports.generateSignature = data => {
  setPrivateKey(config.mikaPrivKey)
  return createSign(JSON.stringify(data))
}

/**
 * Verify signature sent from dana server
 */
module.exports.verifySignature = (data, signature) => {
  setPublicKey(config.danaPubKey)
  return verifySign(JSON.stringify(data), signature)
}

/**
 * Http transport to Dana Server
 */
module.exports.sendRequest = async (endpoint, data) => {
  const resp = await superagent
    .post(config.baseUrl + endpoint)
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('User-Agent', 'MIKA API')
    .send(data)

  return JSON.parse(resp.text)
}
