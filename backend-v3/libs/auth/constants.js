'use strict'

module.exports.errorTypes = {
  FAILED_LOGIN_ATTEMPT_EXCEEDED: 'authFailedLoginExceeded',
  NOT_ALLOWED_TO_CHANGE_PASSWORD: 'authPasswordChangeNotAllowed',
  PASSWORD_EXPIRED: 'authPasswordExpired',
  INVALID_USER: 'authInvalidUser',
  PASSWORD_GENERATION_FAILED: 'authPasswordGenerationFailed',
  CANNOT_CHANGE_TO_USED_PASSWORD: 'authCannotChangeToUsedPassword',
  INVALID_OLD_PASSWORD: 'authInvalidOldPassword'
}

/**
 * User types enumeration used in mika system
 */
module.exports.userTypes = {
  ADMIN: 'admin',
  AGENT: 'agent',
  MERCHANT_STAFF: 'merchantStaff',
  PARTNER_STAFF: 'partnerStaff',
  ACQUIRER_STAFF: 'acquirerStaff'
}

/**
 * User roles enumeration used in mika system
 */
module.exports.userRoles = {
  ADMIN_HEAD: 'adminHead',
  ADMIN_FINANCE: 'adminFinance',
  ADMIN_MARKETING: 'adminMarketing',
  ADMIN_SUPPORT: 'adminSupport',
  ADMIN_LOGISTIC: 'adminLogistic',
  ACQUIRER_STAFF_ADMIN: 'acquirerStaffAdmin'
}

module.exports.eventTypes = {
  AUTH_SUCCESS: 'authSuccess'
}
