'use strict'

/**
 * Providing various constant and function
 * to generate message format for Internal API and External/Public API
 */

const types = require('../configs/msgTypesConfig')

const appConfig = require('../configs/appConfig')

module.exports.types = types

/**
 * Event type enumeration
 */
module.exports.eventTypes = types.eventsTypes

/**
 * Response Message type enumeration
 */
module.exports.msgTypes = types.msgTypes

/**
 * Generate API response message
 */
module.exports.createResponse = (
  messageType,
  data,
  meta,
  toJSON = false
) => {
  let msg = {
    version: appConfig.version,
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
  data,
  meta,
  toJSON = false
) => {
  let msg = {
    version: appConfig.version,
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
 * Create pagination meta object
 */
module.exports.createPaginationMeta = (page, perPage, totalCount) => {
  return {
    page: page,
    ofPages: Math.ceil(totalCount / perPage),
    totalCount: totalCount
  }
}

/**
 * Directly send response message via express.js `res` variable
 */
module.exports.expressCreateResponse = (
  res,
  messageType,
  data,
  meta
) => {
  res
    .status(messageType.httpStatus)
    .send(exports.createResponse(messageType, data, meta))
}

/**
 * Directly send specific entity response message
 * via express.js `res` variable.
 *
 * It will automatically create pagination
 * if `dataTotalCount`, `req.query.page`, `req.query.per_page` exists
 */
module.exports.expressCreateEntityResponse = (
  res,
  data,
  dataTotalCount,
  req
) => {
  if (Array.isArray(data)) {
    exports.expressCreateResponse(
      res,
      data.length > 0
        ? exports.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : exports.msgTypes.MSG_SUCCESS_SINGLE_ENTITY_NOT_FOUND,
      data,
      (dataTotalCount && req)
        ? exports.createPaginationMeta(req.query.page, req.query.per_page, dataTotalCount)
        : undefined
    )
  } else {
    exports.expressCreateResponse(res,
      data
        ? exports.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : exports.msgTypes.MSG_SUCCESS_NO_ENTITY,
      data || undefined
    )
  }
}
