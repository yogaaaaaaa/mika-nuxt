'use strict'

/**
 * Contain all message type used in mika-api, there are http status code (httpStatus)
 * and message status code (status) that exclusive to mika-api.
 *
 * mika-api internal code message format is consist of {{domain}}-{{code}}
 * example :
 *  auth-401 (authentication domain)
 *  sys-500 (system domain)
 *  ent-201 (entity domain)
 * and so on ..
 *
 * Remember to use correct or closely related http status code for your message !
 * See : https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */

const configName = 'msgTypeConfig'

/**
 * Default Message Type Config
 */
let baseConfig = {
  MSG_SUCCESS: {
    httpStatus: 200,
    status: 'sys-200',
    message: 'Success'
  },
  MSG_ERROR: {
    isError: true,
    httpStatus: 500,
    status: 'sys-500',
    message: 'Internal Server Error'
  },
  MSG_ERROR_NOT_IMPLEMENTED: {
    isError: true,
    httpStatus: 501,
    status: 'sys-501',
    message: 'Not implemented'
  },
  MSG_ERROR_BAD_REQUEST: {
    isError: true,
    httpStatus: 400,
    status: 'sys-400',
    message: 'Bad request'
  },
  MSG_BAD_REQUEST_VALIDATION: {
    isError: true,
    httpStatus: 400,
    status: 'sys-401',
    message: 'Bad request, validation error'
  },
  MSG_ERROR_NOT_FOUND: {
    isError: true,
    httpStatus: 404,
    status: 'sys-404',
    message: 'URL Not Found'
  },

  MSG_SUCCESS_ENTITY_RETRIEVED: {
    httpStatus: 200,
    status: 'ent-200',
    message: 'Entity retrieved'
  },
  MSG_SUCCESS_ENTITY_CREATED: {
    httpStatus: 201,
    status: 'ent-201',
    message: 'Entity created'
  },
  MSG_SUCCESS_ENTITY_UPDATED: {
    httpStatus: 201,
    status: 'ent-202',
    message: 'Entity updated'
  },
  MSG_SUCCESS_ENTITY_DELETED: {
    httpStatus: 201,
    status: 'ent-203',
    message: 'Entity deleted'
  },
  MSG_SUCCESS_DELETED_SOFT: {
    httpStatus: 201,
    status: 'ent-204',
    message: 'Entity mark as deleted'
  },
  MSG_ERROR_ENTITY_NOT_FOUND: {
    httpStatus: 404,
    status: 'ent-404',
    message: 'Entity Not found'
  },

  MSG_SUCCESS_AUTH_LOGIN: {
    httpStatus: 200,
    status: 'auth-200',
    message: 'Login Success'
  },
  MSG_SUCCESS_AUTH_LOGOUT: {
    httpStatus: 200,
    status: 'auth-201',
    message: 'Logout Success'
  },
  MSG_SUCCESS_AUTH_TOKEN_CHECK: {
    httpStatus: 200,
    status: 'auth-202',
    message: 'Session token still valid'
  },
  MSG_SUCCESS_AUTH_CHANGE_PASSWORD: {
    httpStatus: 200,
    status: 'auth-203',
    message: 'Password Changed Successfully'
  },
  MSG_ERROR_AUTH_INVALID_CREDENTIAL: {
    isError: true,
    httpStatus: 400,
    status: 'auth-400',
    message: 'Invalid credential for authentication'
  },
  MSG_ERROR_AUTH_INVALID: {
    isError: true,
    httpStatus: 401,
    status: 'auth-401',
    message: 'Not authenticated'
  },
  MSG_ERROR_AUTH_FORBIDDEN: {
    isError: true,
    httpStatus: 403,
    status: 'auth-403',
    message: 'Forbidden to access this resource'
  },
  MSG_ERROR_AUTH_INVALID_TOKEN: {
    isError: true,
    httpStatus: 400,
    status: 'auth-404',
    message: 'Invalid session token'
  },
  MSG_ERROR_INVALID_CIPHERBOX: {
    isError: true,
    httpStatus: 400,
    status: 'auth-420',
    message: 'Cannot open cipherbox'
  },

  MSG_SUCCESS_TRANSACTION_CREATED: {
    httpStatus: 200,
    status: 'trx-200',
    message: 'Transaction created successfully'
  },
  MSG_SUCCESS_TRANSACTION_REDIRECTED: {
    httpStatus: 307,
    status: 'trx-307',
    message: 'Redirect transaction to another payment provider'
  },
  MSG_ERROR_PAYMENT_PROVIDER_NOT_FOR_YOU: {
    httpStatus: 400,
    status: 'trx-400',
    message: 'Cannot use this payment provider'
  },
  MSG_ERROR_NEED_USER_TOKEN: {
    httpStatus: 400,
    status: 'trx-401',
    message: 'This payment provider need user token'
  },
  MSG_ERROR_USER_TOKEN_NOT_FOR_ME: {
    httpStatus: 400,
    status: 'trx-401',
    message: 'User token type is not supported by payment provider'
  },
  MSG_ERROR_AMOUNT_TOO_LOW: {
    isError: true,
    httpStatus: 400,
    status: 'trx-440',
    message: 'Amount is too LOW for this payment provider'
  },
  MSG_ERROR_AMOUNT_TOO_HIGH: {
    isError: true,
    httpStatus: 400,
    status: 'trx-441',
    message: 'Amount is too HIGH for this payment provider'
  },
  MSG_ERROR_CANNOT_CREATE_TRANSACTION: {
    isError: true,
    httpStatus: 500,
    status: 'trx-500',
    message: 'Cannot create transaction due specific error'
  },
  MSG_ERROR_PAYMENT_PROVIDER_NOT_RESPONDING: {
    isError: true,
    httpStatus: 500,
    status: 'trx-501',
    message: 'Cannot create transaction, remote payment provider is not responding'
  }
}

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraBaseConfig = require(`./${configName}_extra`)
  baseConfig = Object.assign({}, baseConfig, extraBaseConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
