'use strict'

/**
 * Quick and dirty sync module.
 * it collect state of all component and check if all component is ready
 */

const events = Object.create(require('events').prototype)

exports.state = {
  READY: 1,
  NOT_READY: 2
}

const components = new Map()

module.exports.addComponent = async (name) => {
  if (!components.get(name)) {
    components.set(name, exports.state.NOT_READY)
  }
}

module.exports.checkReadyAll = () => {
  let component = 0
  let readyComponent = 0

  for (const state of components) {
    if (state[1] === exports.state.READY) {
      readyComponent++
    }
    component++
  }

  if (component === readyComponent) {
    events.emit('ready')
  }
}

module.exports.ready = (name) => {
  components.set(name, exports.state.READY)
  console.log('Ready', name)
  exports.checkReadyAll()
}

module.exports.notReady = (name) => {
  components.set(name, exports.state.NOT_READY)
}

module.exports.readyAllOnce = (handler) => {
  events.once('ready', handler)
}
