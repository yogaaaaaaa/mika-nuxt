'use strict'

/**
 * Contain message type used in mika backend system, there are http status code (httpStatus)
 * and message status code (status).
 *
 * mika-api internal code message format is consist of {{domain}}-{{code}}
 * example :
 *  auth-401 (authentication domain)
 *  sys-500 (system domain)
 *  ent-201 (entity domain)
 * and so on ..
 *
 * Remember to use correct or closely related http status code for your message !
 *
 * See :
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * - https://tools.ietf.org/html/rfc7231
 */
module.exports.msgTypes = {
  MSG_SUCCESS: {
    httpStatus: 200,
    status: 'sys-200',
    message: 'Success'
  },
  MSG_ERROR: {
    isError: true,
    httpStatus: 500,
    status: 'sys-500',
    message: 'Internal server error'
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
  MSG_ERROR_BAD_REQUEST_VALIDATION: {
    isError: true,
    httpStatus: 400,
    status: 'sys-401',
    message: 'Bad request, validation error'
  },
  MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_CHILD: {
    isError: true,
    httpStatus: 400,
    status: 'sys-402',
    message: 'Bad request, invalid entity identifier'
  },
  MSG_ERROR_BAD_REQUEST_UNIQUE_CONSTRAINT: {
    isError: true,
    httpStatus: 409,
    status: 'sys-403',
    message: 'Bad request, unique constraint violation'
  },
  MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_PARENT: {
    isError: true,
    httpStatus: 400,
    status: 'sys-403',
    message: 'Bad request, entity is still referenced by another entity'
  },
  MSG_ERROR_NOT_FOUND: {
    isError: true,
    httpStatus: 404,
    status: 'sys-404',
    message: 'URL not found'
  },
  MSG_SUCCESS_MOVED: {
    httpStatus: 301,
    status: 'sys-301',
    message: 'Endpoint moved'
  },

  MSG_SUCCESS_ENTITY_FOUND: {
    httpStatus: 200,
    status: 'ent-200',
    message: 'Entity(s) found'
  },
  MSG_SUCCESS_ENTITY_CREATED: {
    httpStatus: 201,
    status: 'ent-201',
    message: 'Entity created'
  },
  MSG_SUCCESS_ENTITY_UPDATED: {
    httpStatus: 200,
    status: 'ent-202',
    message: 'Entity updated'
  },
  MSG_SUCCESS_ENTITY_DELETED: {
    httpStatus: 200,
    status: 'ent-203',
    message: 'Entity deleted'
  },
  MSG_SUCCESS_NO_ENTITY: {
    httpStatus: 200,
    status: 'ent-204',
    message: 'No Entity(s)'
  },

  MSG_ERROR_ENTITY_NOT_FOUND: {
    httpStatus: 404,
    isError: true,
    status: 'ent-404',
    message: 'Entity not found'
  },
  MSG_SUCCESS_ENTITY_DO_NOT_NEED_UPDATE: {
    httpStatus: 200,
    status: 'ent-406',
    message: 'Entity not updated'
  },

  MSG_SUCCESS_ENTITY_ASSOCIATED: {
    httpStatus: 201,
    status: 'ent-210',
    message: 'Entity(s) associated'
  },
  MSG_SUCCESS_ENTITY_DISSOCIATED: {
    httpStatus: 200,
    status: 'ent-211',
    message: 'Entity(s) dissociated'
  },
  MSG_SUCCESS_ENTITY_ASSOCIATED_WITH_SOME_FAILED: {
    httpStatus: 207,
    status: 'ent-213',
    message: 'Cannot associate some Entity(s)'
  },
  MSG_SUCCESS_ENTITY_DISSOCIATED_WITH_SOME_FAILED: {
    httpStatus: 207,
    status: 'ent-214',
    message: 'Cannot dissociate some Entity(s)'
  },
  MSG_ERROR_NO_ENTITY_ASSOCIATED: {
    httpStatus: 400,
    isError: true,
    status: 'ent-410',
    message: 'Cannot associate Entity(s)'
  },
  MSG_ERROR_NO_ENTITY_DISSOCIATED: {
    httpStatus: 400,
    isError: true,
    status: 'ent-411',
    message: 'Cannot dissociate Entity(s)'
  },

  MSG_SUCCESS_AUTH_LOGIN: {
    httpStatus: 200,
    status: 'auth-200',
    message: 'Login success'
  },
  MSG_SUCCESS_AUTH_LOGOUT: {
    httpStatus: 200,
    status: 'auth-201',
    message: 'Logout success'
  },
  MSG_SUCCESS_AUTH_TOKEN_CHECK: {
    httpStatus: 200,
    status: 'auth-202',
    message: 'Session token is still valid'
  },
  MSG_SUCCESS_AUTH_CHANGE_PASSWORD: {
    httpStatus: 200,
    status: 'auth-203',
    message: 'Password changed successfully'
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
    message: 'Forbidden to access this endpoint'
  },
  MSG_ERROR_AUTH_INVALID_TOKEN: {
    isError: true,
    httpStatus: 400,
    status: 'auth-404',
    message: 'Invalid session token'
  },
  MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD_INVALID_OLD_PASSWORD: {
    httpStatus: 400,
    status: 'auth-410',
    message: 'Cannot change password, invalid old password'
  },
  MSG_ERROR_AUTH_CIPHERBOX_INVALID: {
    isError: true,
    httpStatus: 400,
    status: 'auth-420',
    message: 'Cannot open cipherbox'
  },
  MSG_ERROR_AUTH_CIPHERBOX_MANDATORY: {
    isError: true,
    httpStatus: 403,
    status: 'auth-421',
    message: 'Cipherbox is mandatory for this endpoint'
  },

  MSG_SUCCESS_TRANSACTION_CREATED: {
    httpStatus: 200,
    status: 'trx-200',
    message: 'Transaction created'
  },
  MSG_SUCCESS_TRANSACTION_CREATED_AND_SUCCESS: {
    httpStatus: 200,
    status: 'trx-201',
    message: 'Transaction created and processed successfully'
  },
  MSG_SUCCESS_TRANSACTION_PENDING_NEED_FOLLOW_UP: {
    httpStatus: 200,
    status: 'trx-202',
    message: 'Transaction pending, follow up action is needed'
  },
  MSG_SUCCESS_TRANSACTION_REDIRECTED: {
    httpStatus: 303,
    status: 'trx-303',
    message: 'Redirect transaction to another acquirer'
  },
  MSG_ERROR_TRANSACTION_INVALID_ACQUIRER: {
    httpStatus: 400,
    status: 'trx-400',
    message: 'Invalid acquirer'
  },
  MSG_ERROR_TRANSACTION_INVALID_AGENT: {
    httpStatus: 400,
    status: 'trx-401',
    message: 'Invalid agent for transaction'
  },
  MSG_ERROR_TRANSACTION_INVALID: {
    httpStatus: 400,
    status: 'trx-404',
    message: 'Invalid transaction'
  },
  MSG_ERROR_TRANSACTION_NEED_USER_TOKEN: {
    httpStatus: 400,
    status: 'trx-410',
    message: 'User token needed'
  },
  MSG_ERROR_TRANSACTION_INVALID_USER_TOKEN: {
    httpStatus: 400,
    status: 'trx-411',
    message: 'Invalid User token'
  },
  MSG_ERROR_TRANSACTION_USER_TOKEN_NOT_SUPPORTED: {
    httpStatus: 400,
    status: 'trx-412',
    message: 'User token type is not supported'
  },
  MSG_ERROR_TRANSACTION_NEED_USER_TOKEN_TYPE: {
    httpStatus: 400,
    status: 'trx-413',
    message: 'Ambiguous user token. Please include user token type'
  },
  MSG_ERROR_TRANSACTION_AMOUNT_TOO_LOW: {
    isError: true,
    httpStatus: 400,
    status: 'trx-440',
    message: 'Transaction amount is too low'
  },
  MSG_ERROR_TRANSACTION_AMOUNT_TOO_HIGH: {
    isError: true,
    httpStatus: 400,
    status: 'trx-441',
    message: 'Transaction amount is too high'
  },
  MSG_ERROR_TRANSACTION_UNSUPPORTED_ACQUIRER: {
    isError: true,
    httpStatus: 500,
    status: 'trx-500',
    message: 'Acquirer is not currently supported'
  },
  MSG_ERROR_TRANSACTION_ACQUIRER_NOT_RESPONDING: {
    isError: true,
    httpStatus: 500,
    status: 'trx-501',
    message: 'Cannot process transaction, acquirer is not responding'
  },
  MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG: {
    isError: true,
    httpStatus: 500,
    status: 'trx-510',
    message: 'Cannot create transaction, invalid acquirer configuration'
  }
}

/**
 * Contain event type used in notification
 */
module.exports.eventTypes = {
  EVENT_GENERIC: 'generic',
  EVENT_TRANSACTION_SUCCESS: 'transactionSuccess',
  EVENT_TRANSACTION_FAILED: 'transactionFailed'
}
