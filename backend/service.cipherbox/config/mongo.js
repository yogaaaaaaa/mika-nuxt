'use strict'

const configName = 'mongoConfig'

const baseConfig = require('./baseConfig')

/**
 * Default mongodb config
 */
let config = {
  mongoURL: process.env['MONGO_URL'] || 'mongodb://localhost:27017',
  mongoReplicaset: process.env['MONGO_RS'] || null,
  mongoDatabase: process.env['MONGO_DBNAME'] || `${baseConfig.name}-${baseConfig.namespace}-db`,
  mongoCollection: process.env['MONGO_COLLECTION'] || `${baseConfig.name}-${baseConfig.namespace}`,
  mongoAppName: process.env['MONGO_APPNAME'] || `${baseConfig.name}-${baseConfig.namespace}`,
  mongoOptions: {}
}

config.mongoOptions = {
  appname: this.mongoAppName,
  replicaSet: this.mongoReplicaset
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraConfig = require(`./${configName}_extra`)
  config = Object.assign({}, config, extraConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = config
