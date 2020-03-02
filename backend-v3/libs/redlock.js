'use strict'

const redis = require('libs/redis')

const Redlock = require('redlock')

const config = require('configs/redlockConfig')

const redlock = new Redlock([redis], config)

module.exports = redlock
