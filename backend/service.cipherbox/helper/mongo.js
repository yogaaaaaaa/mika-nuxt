'use strict'

const mongodb = require('mongodb')

const mongoConfig = require('../config/mongoConfig')

const mongoClient = new mongodb.MongoClient(mongoConfig.mongoURL, mongoConfig.mongoOptions)

module.exports.mongodb = mongodb
module.exports.mongoClient = mongoClient

module.exports.begin = async () => {
  await mongoClient.connect()
}

module.exports.end = async () => {
  await mongoClient.close()
}
