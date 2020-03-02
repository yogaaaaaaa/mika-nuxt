'use strict'

/**
 * Sequelize Database config
 */

const commonDbConfig = {
  username: null,
  password: null,
  database: null,
  dialect: 'postgres',
  freezeTableName: true,
  minifyAliases: true,
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
    database: 'mika_dev',
    host: '127.0.0.1',
    port: 5432,
    logging: true,
    benchmark: true,
    ...commonDbConfig
  },
  production: {
    logging: false,
    benchmark: false,
    ...commonDbConfig
  }
}

// Load external config file
baseConfig = require('./helper').loadAndNestedMerge(__filename, baseConfig)

module.exports = baseConfig
