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
  toJSON = false,
  underscored = true
) => {
  let apiObject = {
    status: messageType.status,
    message: messageType.message,
    isError: messageType.isError || false,
    meta: meta,
    data: data
  }

  if (toJSON) {
    return JSON.stringify(apiObject)
  } else {
    return apiObject
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

/**
 * Generate Notification message
 */
module.exports.createNotificationMessage = (
  eventType = exports.eventTypes.EVENT_GENERIC,
  data = null,
  meta = null,
  toJSON = false
) => {
  let notificationObject = {
    eventType: eventType,
    meta: meta,
    data: data
  }

  if (toJSON) {
    return JSON.stringify(notificationObject)
  } else {
    return notificationObject
  }
}
