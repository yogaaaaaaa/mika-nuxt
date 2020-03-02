'use strict'

const fs = require('fs')
const path = require('path')

module.exports.acquirerHandlers = new Map()

/**
 * Construct a displayable handler information from acquirer handler object
 */
module.exports.formatAcquirerInfo = (acquirerHandler) => {
  return {
    name: acquirerHandler.name,
    classes: acquirerHandler.classes,
    defaultMaximumAmount: acquirerHandler.defaultMaximumAmount ? acquirerHandler.defaultMaximumAmount : null,
    defaultMinimumAmount: acquirerHandler.defaultMinimumAmount ? acquirerHandler.defaultMinimumAmount : null,
    properties: acquirerHandler.properties
  }
}

/**
 * Return an displayable acquirer handler information
 * by its handler name
 */
module.exports.getAcquirerInfo = (handlerName) => {
  const acquirerHandler = exports.acquirerHandlers.get(handlerName)
  if (acquirerHandler) return exports.formatAcquirerInfo(acquirerHandler)
}

/**
 * Load all acquirer handler in current directory
 */
module.exports.loadHandlers = () => {
  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
      const filePath = path.join(__dirname, file)
      if (filePath === __filename) return

      console.log(`trxManager: Loading file '${file}'`)
      let acquirerHandlers = require(filePath)
      if (!Array.isArray(acquirerHandlers)) acquirerHandlers = [acquirerHandlers]

      acquirerHandlers.forEach((acquirerHandler) => {
        if (acquirerHandler && acquirerHandler.name) {
          exports.acquirerHandlers.set(acquirerHandler.name, acquirerHandler)
          console.log(`trxManager: Loaded '${acquirerHandler.name}'`)
        }
      })
    })
}
