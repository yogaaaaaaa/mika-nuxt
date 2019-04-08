'use strict'

module.exports = {
  local: {
    username: 'root',
    password: '',
    database: 'mika_v3_local',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: false,
    freezeTableName: true
  },
  development: {
    username: 'mikadev',
    password: 'mikadev',
    database: 'mika_v3_12',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: false,
    freezeTableName: true,
    logging: false,
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
