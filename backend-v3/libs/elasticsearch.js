'use strict'

const elasticsearch = require('elasticsearch')
const elasticsearchConfig = require('configs/elasticsearchConfig')
const ready = require('libs/ready')

const elasticsearchClient = new elasticsearch.Client(elasticsearchConfig)

ready.addModule('elasticsearch')
elasticsearchClient.ping({
  requestTimeout: 15000
})
  .then(() => {
    ready.ready('elasticsearch')
  })
  .catch((err) => console.error(err))

module.exports = elasticsearchClient
