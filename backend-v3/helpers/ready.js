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

const modules = new Map()

module.exports.addModule = async (name) => {
  if (!modules.get(name)) {
    modules.set(name, exports.state.NOT_READY)
  }
}

module.exports.checkReadyAll = () => {
  let component = 0
  let readyModules = 0

  for (const state of modules) {
    if (state[1] === exports.state.READY) {
      readyModules++
    }
    component++
  }

  if (component === readyModules) {
    events.emit('ready')
  }
}

module.exports.ready = (name) => {
  modules.set(name, exports.state.READY)
  console.log('Module Ready :', name)
  exports.checkReadyAll()
}

module.exports.notReady = (name) => {
  console.log('Module Not Ready :', name)
  modules.set(name, exports.state.NOT_READY)
  events.emit('notReady')
}

module.exports.onReadyAllOnce = (handler) => {
  events.once('ready', handler)
}

module.exports.onReadyAll = (handler) => {
  events.on('ready', handler)
}

module.exports.OnNotReadyAll = (handler) => {
  events.on('notReady', handler)
}
