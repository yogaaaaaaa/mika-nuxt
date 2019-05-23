#!/usr/bin/env node
'use strict'

const crypto = require('crypto')

let keyId = crypto.randomBytes(6).toString('hex')
let keySecret = crypto.randomBytes(12).toString('base64')
let keySecretHashed = crypto.createHash('sha256').update(keySecret).digest('hex')
let keyShared = crypto.randomBytes(12).toString('base64')

let keyApiObject = {
  key_id: keyId,
  key_secret: keySecretHashed,
  key_shared: keyShared
}

console.log('keyId:', keyId)
console.log('keySecret:', keySecret)
console.log('keySecretHashed:', keySecretHashed)
console.log('keyShared:', keyShared)

console.log()

console.log(keyApiObject)
