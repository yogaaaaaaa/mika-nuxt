'use strict'

const _ = require('lodash')

const configName = 'dbConfig'

let baseConfig = {
  development: {
    username: process.env.MIKA_DB_USERNAME || 'mikadev',
    password: process.env.MIKA_DB_PASSWORD || 'mikadev',
    database: process.env.MIKA_DB_NAME || 'mika_v3_31',
    host: process.env.MIKA_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    dialectOptions: {
      timezone: 'Etc/GMT'
    },
    freezeTableName: true,
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    benchmark: true
  },
  production: {
    username: process.env.MIKA_DB_USERNAME,
    password: process.env.MIKA_DB_PASSWORD,
    database: process.env.MIKA_DB_NAME,
    host: process.env.MIKA_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    dialectOptions: {
      timezone: 'Etc/GMT'
    },
    freezeTableName: true,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}

/**
 * Load external config file
 */
try {
  let extraConfig = require(`./_configs/${configName}`)
  _.merge(baseConfig, extraConfig)
  console.log(`Config ${configName} is mixed`)
} catch (error) {}

module.exports = baseConfig
