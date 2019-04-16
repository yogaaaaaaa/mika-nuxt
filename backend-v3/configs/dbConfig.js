'use strict'

module.exports = {
  development: {
    username: process.env.MIKA_DB_USERNAME || 'mikadev',
    password: process.env.MIKA_DB_PASSWORD || 'mikadev',
    database: process.env.MIKA_DB_NAME || 'mika_v3_12',
    host: process.env.MIKA_DB_HOST || '127.0.0.1',
    dialect: 'mysql',

    operatorsAliases: false,
    freezeTableName: true,

    logging: true,
    benchmark: true
  },
  production: {
    username: '',
    password: '',
    database: '',
    host: '127.0.0.1',

    dialect: 'mysql',

    operatorsAliases: false,
    freezeTableName: true,

    logging: false
  }
}
