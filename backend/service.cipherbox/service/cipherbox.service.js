'use strict'

/**
 * service.cipherbox implementation
 */

// const cache = require('./redis')
// const db = require('')
// const cipherbox = require('./cipherbox')

module.exports = {
  name: 'cipherbox',
  metadata: {},
  settings: {},
  events: {
    'event.debug.testLog' () {
      this.logger.info('Test log event received')
    }
  },
  actions: {
    async createKey (context) {
      return { _msg: 'Not Implemented' }
    },
    async getKey (context) {
      return { _msg: 'Not Implemented' }
    },
    async box (context) {
      return { _msg: 'Not Implemented' }
    },
    async unbox (context) {
      return { _msg: 'Not Implemented' }
    },
    async receive (context) {
      return { _msg: 'Not Implemented' }
    },
    async reply (context) {
      return { _msg: 'Not Implemented' }
    }
  },
  created () {
  },
  async started () {
  },
  async stopped () {
  }
}
