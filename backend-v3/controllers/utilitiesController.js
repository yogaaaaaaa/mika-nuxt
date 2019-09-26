'use strict'

const fs = require('fs')

const trxManager = require('../libs/trxManager')
const msg = require('../libs/msg')
const auth = require('../libs/auth')
const cipherbox = require('../libs/cipherbox')

const dirConfig = require('../configs/dirConfig')

module.exports.listTrxManagerProps = (req, res, next) => {
  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    {
      types: trxManager.types,
      handlers: trxManager.acquirerHandlers.map((acquirerHandler) => trxManager.formatAcquirerInfo(acquirerHandler))
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
