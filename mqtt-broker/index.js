'use strict'

const aedes = require('aedes')

const { version } = require('./package.json')
const config = require('config')
const serverFactory = require('./lib/serverFactory')
const authRedisHandler = require('./lib/authRedisHandler')
const redis = require('./lib/redis')
const mosqAuthHash = require('./lib/mosqAuthHash')

async function begin () {
  const broker = aedes()
  const servers = []

  console.log(`Mika MQTT Broker v${version}`)
  if (config.authEnabled) {
    Object.assign(broker, authRedisHandler)
    console.log('Redis auth enabled')
    if (config.authRootPassword) {
      const rootUserKey = config.authPattern.replace(/%u/g, config.authRootUser)
      await redis.set(rootUserKey, await mosqAuthHash.hashPassword(config.authRootPassword))
      console.log('Root user password set')
    }
  }

  if (Array.isArray(config.servers)) {
    for (const serverConfig of config.servers) {
      let server
      if (serverConfig.type === 'tcp') {
        server = serverFactory.createTcp(broker)
        server.listen(serverConfig.port, () => {
          console.log(`TCP listening to ${serverConfig.port}`)
        })
      }
      if (serverConfig.type === 'ws') {
        const server = serverFactory.createWebSocket(broker)
        server.listen(serverConfig.port, () => {
          console.log(`WebSocket listening to ${serverConfig.port}`)
        })
      }
      servers.push(server)
    }
    if (!servers.length) {
      console.log('No Server configuration !')
      process.exit(1)
    }
  }
}

begin()
