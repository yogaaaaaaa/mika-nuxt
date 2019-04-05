'use strict'

/**
 * Providing various constant and function
 * to generate message format for Internal API and External/Public API
 */

/**
 * Event type enumeration
 */
module.exports.eventTypes = require('../config/eventTypeConfig')

/**
 * Response Message type enumeration
 */
module.exports.msgTypes = require('../config/msgTypeConfig')

/**
 * Generate API response message
 */
module.exports.createResponse = (
  messageType,
  data = undefined,
  meta = undefined,
  toJSON = false
) => {
  let msg = {
    status: messageType.status,
    message: messageType.message,
    isError: messageType.isError || false,
    meta,
    data
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
module.exports.createNotification = (
  eventType = exports.eventTypes.EVENT_GENERIC,
  data = undefined,
  meta = undefined,
  toJSON = false
) => {
  let msg = {
    eventType: eventType,
    meta,
    data
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
module.exports.expressCreateResponse = (
  res,
  messageType,
  data = undefined,
  meta = undefined
) => {
  res
    .status(messageType.httpStatus)
    .send(exports.createResponse(messageType, data, meta))
}
