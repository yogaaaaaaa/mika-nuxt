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

function setTimer (name) {
  return setInterval(() => console.log(`Ready: '${name}' is NOT ready in last 10 seconds`), 10000)
}

module.exports.addModule = async (name) => {
  if (!modules.get(name)) {
    console.log(`Ready: new module '${name}'`)
    modules.set(name, {
      state: exports.state.NOT_READY,
      _timer: setTimer(name)
    })
  }
}

module.exports.checkReadyAll = () => {
  let moduleCount = 0
  let readyModuleCount = 0

  for (const module of modules) {
    if (module[1].state === exports.state.READY) readyModuleCount++
    moduleCount++
  }

  if (moduleCount === readyModuleCount) {
    events.emit('ready')
  }
}

module.exports.ready = (name) => {
  const module = modules.get(name)
  if (module) {
    module.state = exports.state.READY
    clearInterval(module._timer)
    module._timer = null
    modules.set(name, module)

    console.log('Ready:', name)

    exports.checkReadyAll()
  }
}

module.exports.notReady = (name) => {
  const module = modules.get(name)
  if (module) {
    module.state = exports.state.NOT_READY
    module._timer = setTimer(name)
    modules.set(name, module)

    console.log('Not Ready:', name)

    events.emit('notReady')
  }
}

module.exports.onReadyAllOnce = (handler) => {
  events.once('ready', handler)
}

module.exports.onReadyAll = (handler) => {
  events.on('ready', handler)
}

module.exports.onNotReadyAll = (handler) => {
  events.on('notReady', handler)
}
