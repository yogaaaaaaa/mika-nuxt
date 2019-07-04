'use strict'

/**
 * Providing various constant and function
 * to generate message format for Internal API and External/Public API
 */

const commonConfig = require('../configs/commonConfig')

const types = require('./types/msgTypes')
module.exports.types = types
module.exports.eventTypes = types.eventTypes
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
    version: commonConfig.version || undefined,
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
    version: commonConfig.version,
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
  exports.expressResponse(
    res,
    exports.msgTypes.MSG_SUCCESS_ENTITY_CREATED,
    data || undefined
  )
}

/**
 * Directly send specific get entity response message
 * via express.js `res` variable.
 *
 * It automatically create pagination details in meta
 * if `dataTotalCount`, `page`, `perPage` exists
 */
module.exports.expressGetEntityResponse = (
  res,
  data,
  dataTotalCount,
  page,
  perPage
) => {
  if (Array.isArray(data)) {
    exports.expressResponse(
      res,
      data.length > 0
        ? exports.msgTypes.MSG_SUCCESS_ENTITY_FOUND
        : exports.msgTypes.MSG_SUCCESS_NO_ENTITY,
      data,
      (dataTotalCount && page && perPage)
        ? exports.createPaginationMeta(page, perPage, dataTotalCount)
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
  updated,
  data,
  found = true
) => {
  if (!found) {
    exports.expressResponse(res,
      exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
    return
  }
  if (updated) {
    exports.expressResponse(res,
      exports.msgTypes.MSG_SUCCESS_ENTITY_UPDATED,
      data || undefined
    )
  } else {
    exports.expressResponse(res,
      exports.msgTypes.MSG_SUCCESS_ENTITY_DO_NOT_NEED_UPDATE
    )
  }
}

/**
 * Directly send specific delete entity response message
 * via express.js `res` variable.
 */
module.exports.expressDeleteEntityResponse = (
  res,
  found
) => {
  if (!found) {
    exports.expressResponse(
      res,
      exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
    return
  }
  exports.expressResponse(
    res,
    exports.msgTypes.MSG_SUCCESS_ENTITY_DELETED
  )
}

/**
 * Directly send specific associate entity(s) response message
 * via express.js `res` variable.
 */
module.exports.expressAssociateEntityResponse = (
  res,
  found,
  failedIds,
  idsLength
) => {
  if (!found) {
    exports.expressResponse(
      res,
      exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
    return
  }

  if (Array.isArray(failedIds) && idsLength) {
    if (failedIds.length > 0) {
      exports.expressResponse(
        res,
        failedIds.length === idsLength
          ? exports.msgTypes.MSG_ERROR_NO_ENTITY_ASSOCIATED
          : exports.msgTypes.MSG_SUCCESS_ENTITY_ASSOCIATED_WITH_SOME_FAILED,
        { failedIds }
      )
      return
    }
  }

  exports.expressResponse(
    res,
    exports.msgTypes.MSG_SUCCESS_ENTITY_ASSOCIATED
  )
}

/**
 * Directly send specific dissociate entity(s) response message
 * via express.js `res` variable.
 */
module.exports.expressDissociateEntityResponse = (
  res,
  found,
  failedIds,
  idsLength
) => {
  if (!found) {
    exports.expressResponse(
      res,
      exports.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND
    )
    return
  }

  if (Array.isArray(failedIds) && idsLength) {
    if (failedIds.length > 0) {
      exports.expressResponse(
        res,
        failedIds.length === idsLength
          ? exports.msgTypes.MSG_ERROR_NO_ENTITY_DISSOCIATED
          : exports.msgTypes.MSG_SUCCESS_ENTITY_DISSOCIATED_WITH_SOME_FAILED,
        { failedIds }
      )
      return
    }
  }

  exports.expressResponse(
    res,
    exports.msgTypes.MSG_SUCCESS_ENTITY_DISSOCIATED
  )
}
