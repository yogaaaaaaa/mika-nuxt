'use strict'

const _ = require('lodash')

const msg = require('libs/msg')
const validator = require('validator')

module.exports.identifierIntValidator = (reqPaths) =>
  (req, res, next) => {
    if (Array.isArray(reqPaths)) {
      for (const path of reqPaths) {
        const value = _.get(req, path)
        if (value !== undefined) {
          if (!validator.isInt(value)) {
            msg.expressResponse(res, msg.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND)
            return
          }
        }
      }
    }
    next()
  }
