'use strict'

const net = require('net')
const http = require('http')
const ws = require('websocket-stream')

module.exports.createTcp = (broker) => net.createServer(broker.handle)

module.exports.createWebSocket = (broker) => {
  const httpServer = http.createServer()
  ws.createServer({ server: httpServer }, broker.handle)

  return httpServer
}
