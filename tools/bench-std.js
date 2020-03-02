#!/usr/bin/env node
'use strict'

const commander = require('commander')
const autocannon = require('autocannon')
const fs = require('fs')
const path = require('path')

commander
  .description('Standard bench : autocannon benchmark with connections sweep')
  .option('-c, --config <file>', 'Specify config file', 'configs/bench-std-config.js')
commander.parse(process.argv)

const baseConfig = {
  method: 'GET',
  url: 'http://localhost',
  duration: 10,
  headers: {},
  body: null,
  pipelining: 1,

  connStart: 0,
  connEnd: 300,
  connStep: 10,
  output: null
}
let config = {}

async function begin (config) {
  const timestamp = Date.now()
  const benchResultDir = path.resolve('./_bench-result')

  if (!fs.existsSync(benchResultDir)) {
    fs.mkdirSync(benchResultDir)
  }

  if (config.output) {
    try {
      fs.writeFileSync(config.output, '')
    } catch (error) {
      console.log(`Cannot access file : ${config.output}`)
      process.exit(1)
    }
  }

  let conn = config.connStart
  const results = []
  const csvResults = [[
    'connections',
    'method',
    'url',

    'requestsP1',
    'requestsP2_5',
    'requestsP50',
    'requestsP97_5',
    'requestsP99',
    'requestsAvg',
    'requestsStddev',
    'requestsMin',
    'requestsMax',
    'requestsTotal',
    'requestsSent',

    'throughputP1',
    'throughputP2_5',
    'throughputP50',
    'throughputP97_5',
    'throughputP99',
    'throughputAvg',
    'throughputStddev',
    'throughputMin',
    'throughputMax',
    'throughputTotal',

    'latencyP1',
    'latencyP2_5',
    'latencyP50',
    'latencyP97_5',
    'latencyP99',
    'latencyAvg',
    'latencyStddev',
    'latencyMin',
    'latencyMax',

    'duration',
    'errors',
    'timeouts',
    '2xx',
    'non2xx'
  ]]

  console.log()
  console.log('## Config')
  console.log(JSON.stringify(config, null, 2))
  console.log()

  while (conn <= config.connEnd) {
    config.connections = conn || 1

    process.stdout.write(`# Connections : ${config.connections} ... `)

    const result = await autocannon(config)

    results.push(result)
    csvResults.push([
      result.connections,
      config.method,
      result.url,

      result.requests.p1,
      result.requests.p2_5,
      result.requests.p50,
      result.requests.p97_5,
      result.requests.p99,
      result.requests.average,
      result.requests.stddev,
      result.requests.min,
      result.requests.max,
      result.requests.total,
      result.requests.sent,

      result.throughput.p1,
      result.throughput.p2_5,
      result.throughput.p50,
      result.throughput.p97_5,
      result.throughput.p99,
      result.throughput.average,
      result.throughput.stddev,
      result.throughput.min,
      result.throughput.max,
      result.throughput.total,

      result.latency.p1,
      result.latency.p2_5,
      result.latency.p50,
      result.latency.p97_5,
      result.latency.p99,
      result.latency.average,
      result.latency.stddev,
      result.latency.min,
      result.latency.max,

      result.duration,
      result.errors,
      result.timeouts,
      result['2xx'],
      result.non2xx
    ])

    console.log('done')
    conn += config.connStep
  }

  console.log()
  console.log('## Test done')

  fs.writeFileSync(path.join(benchResultDir, `bench-std-results-${timestamp}.json`), JSON.stringify(results, null, 1))
  fs.writeFileSync(
    config.output || path.join(benchResultDir, `bench-std-results-${timestamp}.csv`),
    csvResults.map((csvResult) => csvResult.join(',')).join('\n')
  )

  console.log('## Results saved')
}

if (commander.config) {
  if (fs.existsSync(commander.config)) config = require(path.resolve(commander.config))
}

begin(Object.assign({}, baseConfig, config))
