'use strict'

/**
 * Providing various constant and function
 * to generate message format for Internal API and External/Public API
 */

module.exports.messageTypes = require('../config/msgTypeConfig')
module.exports.eventTypes = require('../config/eventTypeConfig')

/**
 * Generate API response message
 */
module.exports.createResponseMessage = (
  messageType,
  data = null,
  meta = null,
  toJSON = false
) => {
  let msg = {
    status: messageType.status,
    message: messageType.message,
    isError: messageType.isError || false
  }

  if (meta) {
    msg.meta = meta
  }

  if (data) {
    msg.data = data
  }

  if (toJSON) {
    return JSON.stringify(msg)
  } else {
    return msg
  }
}

/**
 * Generate Notification message
 */
module.exports.createNotificationMessage = (
  eventType = exports.eventTypes.EVENT_GENERIC,
  data = null,
  meta = null,
  toJSON = false
) => {
  let msg = {
    eventType: eventType
  }

  if (meta) {
    msg.meta = meta
  }

  if (data) {
    msg.data = data
  }

  if (toJSON) {
    return JSON.stringify(msg)
  } else {
    return msg
  }
}

/**
 * Generate meta object for pagination
 */
module.exports.createPaginationMeta = (page, perPage, totalCount) => {
  return {
    page: page,
    pages: Math.ceil(totalCount / perPage),
    totalCount: totalCount
  }
}

/**
 * Directly send response message via express.js res variable
 */
module.exports.expressCreateResponseMessage = (
  res,
  messageType,
  data = null,
  meta = null
) => {
  res
    .status(messageType.httpStatus)
    .send(exports.createResponseMessage(messageType, data, meta))
}
