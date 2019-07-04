'use strict'

/**
 * Sequelize Database config
 */

const _ = require('lodash')

const commonDbConfig = {
  username: null,
  password: null,
  database: null,
  dialect: 'mysql',
  dialectOptions: {
    timezone: 'Etc/GMT'
  },
  freezeTableName: true,
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000
  }
}

let baseConfig = {
  development: {
    username: 'mikadev',
    password: 'mikadev',
    database: 'mika_v3_31',
    host: '127.0.0.1',
    port: 3306,
    logging: console.log,
    benchmark: true,
    ...commonDbConfig
  },
  production: {
    database: 'mika',
    replication: {
      write: { host: '127.0.0.1', username: 'mikadev', password: 'mikadev' },
      read: [
        { host: '127.0.0.1', username: 'mikadev', password: 'mikadev' }
      ]
    },
    logging: false,
    benchmark: false,
    ...commonDbConfig
  }
}

/**
 * Load external config file
 */
try {
  const configName = require('path').basename(__filename, '.js')
  let extraConfig = require(`./${process.env.MIKA_CONFIG_GROUP ? `_configs.${process.env.MIKA_CONFIG_GROUP}` : '_configs'}/${configName}`)
  _.merge(baseConfig, extraConfig)
  console.log(`${configName} is mixed`)
} catch (err) {}

module.exports = baseConfig
