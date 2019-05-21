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
module.exports.expressResponse = (
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
 * Directly send specific create entity response message
 * via express.js `res` variable.
 */
module.exports.expressCreateEntityResponse = (
  res,
  data
) => {
  exports.expressResponse(res,
    data
      ? exports.msgTypes.MSG_SUCCESS_ENTITY_CREATED
      : exports.msgTypes.MSG_SUCCESS_ENTITY_CREATED_NO_DATA,
    data || undefined
  )
}

/**
 * Directly send specific get entity response message
 * via express.js `res` variable.
 *
 * It will automatically create pagination
 * if `dataTotalCount`, `req.query.page`, `req.query.per_page` exists
 */
module.exports.expressGetEntityResponse = (
  res,
  data,
  dataTotalCount,
  req
) => {
  if (Array.isArray(data)) {
    exports.expressResponse(
      res,
      data.length > 0
        ? exports.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : exports.msgTypes.MSG_SUCCESS_NO_ENTITY,
      data,
      (dataTotalCount && req)
        ? exports.createPaginationMeta(req.query.page, req.query.per_page, dataTotalCount)
        : undefined
    )
  } else {
    exports.expressResponse(res,
      data
        ? exports.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND,
      data || undefined
    )
  }
}

/**
 * Directly send specific update entity response message
 * via express.js `res` variable.
 */
module.exports.expressUpdateEntityResponse = (
  res,
  updateCount,
  data,
  found = true
) => {
  if (!found) {
    exports.expressResponse(res,
      exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
    return
  }
  if (updateCount) {
    exports.expressResponse(res,
      exports.msgTypes.MSG_SUCCESS_ENTITY_UPDATED,
      data || undefined
    )
  } else {
    exports.expressResponse(res,
      exports.msgTypes.MSG_SUCCESS_NO_ENTITY_UPDATED
    )
  }
}

/**
 * Directly send specific delete entity response message
 * via express.js `res` variable.
 */
module.exports.expressDeleteEntityResponse = (
  res,
  deleteCount,
  found = true
) => {
  if (!found) {
    exports.expressResponse(res,
      exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
    return
  }
  if (deleteCount) {
    exports.expressResponse(
      res,
      exports.msgTypes.MSG_SUCCESS_ENTITY_DELETED
    )
  } else {
    exports.expressResponse(
      res,
      exports.msgTypes.MSG_SUCCESS_NO_ENTITY_DELETED
    )
  }
}
