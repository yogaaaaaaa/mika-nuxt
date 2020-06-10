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
  MSG_SUCCESS_MOVED: {
    httpStatus: 301,
    status: 'sys-301',
    message: 'Endpoint moved'
  },
  MSG_ERROR: {
    isError: true,
    httpStatus: 500,
    status: 'sys-500',
    message: 'Internal server error. Please report this error to Mika'
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
  MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_PARENT: {
    isError: true,
    httpStatus: 400,
    status: 'sys-403',
    message: 'Bad request, this entity is still referred by another entity'
  },
  MSG_ERROR_NOT_FOUND: {
    isError: true,
    httpStatus: 404,
    status: 'sys-404',
    message: 'URL not found'
  },
  MSG_ERROR_BAD_REQUEST_UNIQUE_CONSTRAINT: {
    isError: true,
    httpStatus: 409,
    status: 'sys-409',
    message: 'Bad request, unique constraint error'
  },

  MSG_SUCCESS_BATCH_JOB_STARTED: {
    httpStatus: 200,
    status: 'job-200',
    message: 'Batch job is started'
  },
  MSG_ERROR_BATCH_JOB_NO_DATA: {
    isError: true,
    httpStatus: 200,
    status: 'job-400',
    message: 'No data available for batch job'
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
    isError: true,
    httpStatus: 404,
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
    isError: true,
    httpStatus: 400,
    status: 'ent-410',
    message: 'Cannot associate Entity(s)'
  },
  MSG_ERROR_NO_ENTITY_DISSOCIATED: {
    isError: true,
    httpStatus: 400,
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
    message: 'Password changed'
  },
  MSG_SUCCESS_AUTH_PASSWORD_RESET: {
    httpStatus: 200,
    status: 'auth-204',
    message: 'Password reset'
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
  MSG_ERROR_AUTH_INVALID_OLD_PASSWORD: {
    isError: true,
    httpStatus: 400,
    status: 'auth-410',
    message: 'Invalid old password'
  },
  MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD: {
    isError: true,
    httpStatus: 400,
    status: 'auth-411',
    message: 'Cannot change password'
  },
  MSG_ERROR_AUTH_CANNOT_CHANGE_TO_USED_PASSWORD: {
    isError: true,
    httpStatus: 400,
    status: 'auth-412',
    message: 'Cannot change password, password is already used'
  },
  MSG_ERROR_AUTH_INVALID_EXPIRED_PASSWORD: {
    isError: true,
    httpStatus: 401,
    status: 'auth-420',
    message: 'Cannot authenticate, password expired'
  },
  MSG_ERROR_AUTH_FAILED_LOGIN_ATTEMPT_EXCEEDED: {
    isError: true,
    httpStatus: 401,
    status: 'auth-421',
    message: 'Too many failed authentication, please try again later'
  },
  MSG_ERROR_AUTH_CIPHERBOX_INVALID: {
    isError: true,
    httpStatus: 400,
    status: 'auth-430',
    message: 'Cannot open cipherbox'
  },
  MSG_ERROR_AUTH_CIPHERBOX_MANDATORY: {
    isError: true,
    httpStatus: 403,
    status: 'auth-431',
    message: 'Cipherbox is mandatory for this endpoint'
  },
  MSG_ERROR_AUTH_PASSWORD_CHECK_FAILED_BAD_FORMAT: {
    isError: true,
    httpStatus: 400,
    status: 'auth-440',
    message: 'Password check failed, bad password format'
  },
  MSG_ERROR_AUTH_PASSWORD_CHECK_FAILED_ALREADY_USED: {
    isError: true,
    httpStatus: 400,
    status: 'auth-441',
    message: 'Password check failed, password is already used'
  },

  MSG_ERROR_AUTH_SELF_PASSWORD_CHECK: {
    isError: true,
    httpStatus: 400,
    status: 'auth-450',
    message: 'Invalid password'
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
  MSG_SUCCESS_TRANSACTION_CREATED_AND_NEED_FOLLOW_UP: {
    httpStatus: 200,
    status: 'trx-202',
    message: 'Transaction created, follow up action is needed'
  },
  MSG_SUCCESS_TRANSACTION_REVERSED: {
    httpStatus: 200,
    status: 'trx-203',
    message: 'Transaction reversed'
  },
  MSG_SUCCESS_TRANSACTION_VOIDED: {
    httpStatus: 200,
    status: 'trx-204',
    message: 'Transaction voided'
  },
  MSG_SUCCESS_TRANSACTION_REFUNDED: {
    httpStatus: 200,
    status: 'trx-205',
    message: 'Transaction refunded'
  },
  MSG_SUCCESS_TRANSACTION_PARTIALLY_REFUNDED: {
    httpStatus: 200,
    status: 'trx-206',
    message: 'Transaction partially refunded'
  },
  MSG_SUCCESS_TRANSACTION_SETTLEMENT_STARTED: {
    httpStatus: 200,
    status: 'trx-210',
    message: 'Settlement job is started'
  },

  MSG_ERROR_TRANSACTION_INVALID_ACQUIRER: {
    isError: true,
    httpStatus: 400,
    status: 'trx-400',
    message: 'Invalid acquirer'
  },
  MSG_ERROR_TRANSACTION_INVALID_AGENT: {
    isError: true,
    httpStatus: 400,
    status: 'trx-401',
    message: 'Invalid agent for transaction'
  },
  MSG_ERROR_TRANSACTION_STILL_RUNNING: {
    isError: true,
    httpStatus: 400,
    status: 'trx-402',
    message: 'Another transaction/settlement process is still running'
  },
  MSG_ERROR_TRANSACTION_INVALID_SETTLE_BATCH: {
    isError: true,
    httpStatus: 400,
    status: 'trx-403',
    message: 'Invalid settle batch'
  },
  MSG_ERROR_TRANSACTION_INVALID: {
    isError: true,
    httpStatus: 400,
    status: 'trx-404',
    message: 'Invalid transaction'
  },
  MSG_ERROR_TRANSACTION_UNFINISHED_EXIST: {
    isError: true,
    httpStatus: 400,
    status: 'trx-405',
    message: 'Unfinished transaction with same acquirer and agent exist'
  },
  MSG_ERROR_TRANSACTION_ORDER_REFERENCE_FINISHED: {
    isError: true,
    httpStatus: 400,
    status: 'trx-406',
    message: 'Order reference is already finished by another transaction'
  },
  MSG_ERROR_TRANSACTION_NEED_USER_TOKEN: {
    isError: true,
    httpStatus: 400,
    status: 'trx-410',
    message: 'User token needed'
  },
  MSG_ERROR_TRANSACTION_INVALID_USER_TOKEN: {
    isError: true,
    httpStatus: 400,
    status: 'trx-411',
    message: 'Invalid User token'
  },
  MSG_ERROR_TRANSACTION_USER_TOKEN_NOT_SUPPORTED: {
    isError: true,
    httpStatus: 400,
    status: 'trx-412',
    message: 'User token type is not supported'
  },
  MSG_ERROR_TRANSACTION_NEED_USER_TOKEN_TYPE: {
    isError: true,
    httpStatus: 400,
    status: 'trx-413',
    message: 'Ambiguous user token. Please include user token type'
  },
  MSG_ERROR_TRANSACTION_VOID_NOT_SUPPORTED: {
    isError: true,
    httpStatus: 400,
    status: 'trx-414',
    message: 'Void is not supported for this acquirer'
  },
  MSG_ERROR_TRANSACTION_REFUND_NOT_SUPPORTED: {
    isError: true,
    httpStatus: 400,
    status: 'trx-415',
    message: 'Refund is not supported for this acquirer'
  },
  MSG_ERROR_TRANSACTION_PARTIAL_REFUND_NOT_SUPPORTED: {
    isError: true,
    httpStatus: 400,
    status: 'trx-416',
    message: 'Partial refund is not supported for this acquirer'
  },
  MSG_ERROR_TRANSACTION_REFUND_INVALID_AMOUNT: {
    isError: true,
    httpStatus: 400,
    status: 'trx-417',
    message: 'Invalid amount for refund'
  },
  MSG_ERROR_TRANSACTION_REDIRECT_NO_MATCH: {
    isError: true,
    httpStatus: 400,
    status: 'trx-418',
    message: 'Redirect failed, matching acquirer not found'
  },
  MSG_ERROR_TRANSACTION_REVERSE_NOT_SUPPORTED: {
    isError: true,
    httpStatus: 400,
    status: 'trx-419',
    message: 'Current transaction status reverse is not supported by acquirer'
  },
  MSG_ERROR_TRANSACTION_UNFINISHED_SETTLE_BATCH: {
    isError: true,
    httpStatus: 500,
    status: 'trx-420',
    message: 'Current settle batch is already in processing'
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
  MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG: {
    isError: true,
    httpStatus: 500,
    status: 'trx-500',
    message: 'Invalid acquirer configuration'
  },
  MSG_ERROR_TRANSACTION_TOO_MANY_REDIRECT: {
    isError: true,
    httpStatus: 500,
    status: 'trx-501',
    message: 'Too many redirect, possibly caused by invalid acquirer configuration'
  },

  MSG_ERROR_TRANSACTION_ACQUIRER_HOST_NO_RESPONSE: {
    isError: true,
    httpStatus: 500,
    status: 'trx-510',
    message: 'No response from acquirer host'
  },
  MSG_ERROR_TRANSACTION_ACQUIRER_HOST_RESPONSE_ERROR: {
    isError: true,
    httpStatus: 500,
    status: 'trx-511',
    message: 'Acquirer host response error'
  },
  MSG_ERROR_TRANSACTION_PROCESSING_ERROR_AND_REVERSED: {
    isError: true,
    httpStatus: 500,
    status: 'trx-512',
    message: 'Processing error. Transaction has been reversed'
  },
  MSG_ERROR_TRANSACTION_PROCESSING_ERROR: {
    isError: true,
    httpStatus: 500,
    status: 'trx-513',
    message: 'General processing error'
  },
  MSG_ERROR_TRANSACTION_INVALID_ON_ACQUIRER_HOST: {
    isError: true,
    httpStatus: 500,
    status: 'trx-519',
    message: 'Invalid transaction on acquirer host, please report this error to MIKA'
  },

  MSG_ERROR_TERMINAL_MANAGER_INVALID_TOKEN: {
    isError: true,
    httpStatus: 400,
    status: 'term-400',
    message: 'Cannot process, invalid token or data'
  },
  MSG_ERROR_TERMINAL_MANAGER_INVALID_CONFIG: {
    isError: true,
    httpStatus: 500,
    status: 'term-500',
    message: 'Cannot process, invalid terminal configuration or terminal type'
  },
  MSG_ERROR_TERMINAL_MANAGER_ACQUIRER_HOST_ERROR: {
    isError: true,
    httpStatus: 500,
    status: 'term-510',
    message: 'Cannot process, acquirer terminal host response error'
  }
}

/**
 * Contain event type used in notification
 */
module.exports.eventTypes = {
  EVENT_GENERIC: 'generic',
  EVENT_BATCH_JOB: 'batchJob',

  EVENT_TRANSACTION: 'transaction',
  EVENT_SETTLE_BATCH: 'settleBatch',

  /** Deprecated */
  EVENT_TRANSACTION_SUCCESS: 'transactionSuccess',
  EVENT_TRANSACTION_FAILED: 'transactionFailed',
  EVENT_TRANSACTION_EXPIRED: 'transactionExpired'
}
