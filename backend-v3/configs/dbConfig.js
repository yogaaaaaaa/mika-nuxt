'use strict'

module.exports = {
  development: {
    username: process.env.MIKA_DB_USERNAME || 'mikadev',
    password: process.env.MIKA_DB_PASSWORD || 'mikadev',
    database: process.env.MIKA_DB_NAME || 'mika_v3_12',
    host: process.env.MIKA_DB_HOST || '127.0.0.1',
    dialect: 'mariadb',
    freezeTableName: true,
    logging: console.log,
    benchmark: true
  },
  production: {
    username: process.env.MIKA_DB_USERNAME,
    password: process.env.MIKA_DB_PASSWORD,
    database: process.env.MIKA_DB_NAME,
    host: process.env.MIKA_DB_HOST || '127.0.0.1',
    dialect: 'mariadb',
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
