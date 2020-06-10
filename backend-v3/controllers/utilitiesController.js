'use strict'

const fs = require('fs')

const trxManager = require('libs/trxManager')
const msg = require('libs/msg')
const auth = require('libs/auth')
const cipherbox = require('libs/cipherbox')
const configStatic = require('libs/configStatic')

const dirConfig = require('configs/dirConfig')
const agentClientConfig = require('configs/agentClientConfig')

const aidsFilepath = configStatic.loadAndCacheAids()
const capksFilePath = configStatic.loadAndCacheCapks()

module.exports.staticFileAids = (req, res, next) => res.sendFile(aidsFilepath)
module.exports.staticFileCapks = (req, res, next) => res.sendFile(capksFilePath)

module.exports.listTrxManagerProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      types: trxManager.constants,
      handlers: Array.from(trxManager.acquirerHandlers.values()).map((acquirerHandler) => trxManager.formatAcquirerInfo(acquirerHandler))
    }
  )
}

module.exports.listMsgProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      msgTypes: msg.msgTypes,
      eventTypes: msg.eventTypes
    }
  )
}

module.exports.listAuthProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      userRoleTypes: auth.userRoles,
      userTypes: auth.userTypes,
      cipherboxKeyStatuses: cipherbox.keyStatuses
    }
  )
}

module.exports.listThumbnails = async (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    await (new Promise((resolve, reject) => {
      fs.readdir(dirConfig.thumbnailsDir, {
        withFileTypes: true
      }, (err, files) => {
        if (err) reject(err)
        resolve(files.filter(file => file.isFile()).map(file => file.name))
      })
    }))
  )
}

module.exports.getAgentClientConfig = async (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    agentClientConfig
  )
}

module.exports.listTrxManagerPropsMiddlewares = [
  exports.listTrxManagerProps
]

module.exports.listMsgPropsMiddlewares = [
  exports.listMsgProps
]

module.exports.listAuthPropsMiddlewares = [
  exports.listAuthProps
]

module.exports.listThumbnailsMiddlewares = [
  exports.listThumbnails
]

module.exports.staticFileAidsMiddlewares = [
  exports.staticFileAids
]

module.exports.staticFileCapksMiddlewares = [
  exports.staticFileCapks
]

module.exports.getAgentClientConfigMiddlewares = [
  exports.getAgentClientConfig
]
