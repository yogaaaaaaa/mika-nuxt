# Changelog
All notable changes to this project will be documented in this file.

After version 3.1.0, this project follow these guidelines,
  - Try to follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format whenever possible.
  - Please keep any changes simple and concise. Put any detailed information 
    on __backend-v3 Postman documentation__.
  - Use modified/mapped semantic versioning format,
    ```
    3.<release-number>.<hotfix-number>

    Example
      3.3.0 (release 3)
      3.3.1 (hotfix 1 for release 3)
    ```
    Remember, to include any hotfix changes in this changelog and incorporate 
    any changes in next release.

## [3.10.0] - 2019-10-09
### Added
  - Added `kumabank` transaction manager handler for testing card payment in development environment,
    replacing `fairpay`
### Changed
  - Change version display in `development` environment
    ```
    [environment] [branch] [commitHash] [commitCount] [timestamp]
    mika-v3-development andra-dev10-c0a6a5a-101 2019-09-26T04:42:05.000Z
    ```
  - Moved several ignore pattern from local `.gitignore` to global `.gitignore`
### Fixed
 - Fixed cannot associate/dissociate archived outlet
 - Fixed missing `types` in `trx_props` caused by naming convention change
   from `types` to `constants` (see version `3.9.0` changelog)
 - Fixed invalid count with several GET entity. Caused by deep `where` parameter
   without `required` parameter in parent
   ```js
   // Example: Query to get agent by merchant id. 
   
   // Parameter `where` is used as condition to include (or JOIN) merchant.
   // If `required: true` is not included, findAllAndCountAll will return wrong count.
   // Under the hood, `required: true` will force sequelize to use INNER JOIN instead
   // of LEFT JOIN.
   const query = {
     model: models.agent,
     include: [
       {
         model: models.outlet,
         required: true // required should be included here
         include: [
           {
             model: models.merchant
             where: { id: currentMerchantId } // deep where
           }
         ]
       }
     ]
   }
   ```

## [3.9.0] - 2019-09-25
### Added
  - [__Feature__] Added password policy for users (`admin`, `merchantStaff`, `agent`) 
    to adhere to PCI DSS.
    - Password format must at least contain alphanumeric and 8 character in length
    - Password expiry and unauthenticated expired password change feature
    - User cannot change to several last used password
    - User lockout after several failed login attempt
    - Password reset (randomly generated) which expire immediately
    - All of these feature can be turned off for each user
      and controlled via config file, except for password format
    - Debug endpoint to change password policy state for specified user
  - [__Feature__] Added new business entity, acquirer company (`acquirerCompany`) 
    and its user, acquirer staff (`acquirerStaff`) which capable to see 
    `transaction`,`agent`, and `outlet` with `acquirer` associated with it. 
    Migration, model and controller is added/changed to support this new feature
  - Enforce acquirer class in `trxManager`. When creating payment transaction 
    `acquirerType.class` must be supported by `handler` in `acquirerConfig`
  - Added `standard` in development dependencies with its runnable script via npm
  - Added `fastest-validator` as alternative validator to `express-validator`, 
    which uses same middleware to catch validator error (`errorMiddleware.js` - `validatorErrorHandler`)
  - New gopay logo
### Changed
  - Changed changelog format to loosely following  [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
  - Defined new version format in changelog, which is based on semantic versioning
  - Package dependencies update
  - Over 90 files of code is automatically refactored 
    to adhere with `standard.js` version 14.x.x (previously 12.x.x).
  - Moved error handling from individual controller 
    to an error map (`errorMap.js` in `libs/constants`) in global error middleware
  - Renamed `libs/types` to `libs/constants`, all imports is updated accordingly
    - Removed `types` postfix in all `constants` files, e.g `trxManagerTypes.js` to `trxManager.js`
  - Added `merchant` sub-object to several admin endpoint
  - All user is now able to see archived entity, except for agent acquirers.
    To see all agent acquirers, `archived=1` query string parameter must be included
    in request
  - Timestamp field is now available in (almost) all entity GET endpoints.
  - Changed past migration, __manual migration for existing database is needed__
    - in `0012-create-terminal-batch.js`
      - `dateArrived` column is changed to `arrivedAt` (DATETIME, allow null)
    - in `0021-create-acquirer.js`
      - `acquirerConfigId` is changed to not null
  - Several acquirer business information (`processFee`, `shareMerchant`, and `shareAcquirer`) is
    saved on `transaction` creation. Statistics calculation is done with data from `transaction` instead of `acquirer`.
  - Refactor model query helper (`models/helper/query.js`), moved out string operation 
    into standalone library (`libs/string.js`)
  - Moved out `transactionController.js` validators to `validators/transaction.js`
  - Changed `sequelizeToQueryMiddleware.common`. When `archived` query string is set, 
    sequelize `paranoid`  query parameter will be set recursively into included model 
    (via `req.applySequelizeCommonScope`)
### Fixed
  - Fixed migration which create double unique constraint key. __Manual migration for existing database is needed__
    - In `0027-change-column-merchant-shortname-allownull.js` for column `shortName`
    - In `0028-change-column-transaction-idalias-coll-ci.js` for column `idAlias`
  - Fixed missing `isError` in several `msgTypes`
  - Fixed invalid validator for creating `acquirer` by `admin`
  - Fixed `filter[]` validator in GET `transaction` entity for admin
  - Fixed user parent check when login. User with archived parent 
    (e.g `agent` with archived `merchant`) is not allowed to login
  - Fixed erratic ordering when `get_count` is enabled in GET entity endpoints. 
    Fixes by adding default order by `id` in each query (via `queryToSequelize.pagination` middleware)
  - Fixed missing scope when getting `agent` by id as `merchantStaff`. It will allow
    any id to be fetch regardless that `agent` is under currently logged on `merchantStaff` or not

## [3.1.0] - 2019-09-10
### Highlight
  - __Fixed intermittent Read-after-write problems. All read-after-write must executed as one transaction__ 
    - Fixed read-after-write error in `trxManager.create`
    - Fixed possible read-after-write error in `trxManager` expiry handler
    - Fixed read-after-write error in acquirer host notification
    - Fixed read-after-write error in CRUD
  - __Fixed error when updating any user (merchant staff, agent, admin) object without password__
  - __Field Changes__
    - `{{baseUrl}}/api/auth/login` for user type `agent`
      - Added `brokerUrlAlt` in `brokerDetails`
    - `{{baseUrl}}/api/merchant_staff/statistics/transactions/by_acquirer`
      - Changed `amount` to `totalAmount`
      - Changed `nettAmount` to `totalNettAmount`
      - Added `totalAmountNoRefund`
    - `{{baseUrl}}/api/back_office/acquirer_configs` and `{{baseUrl}}/api/back_office/acquirer_configs/:acquirerId`
      - Added `acquirerConfig` sub-object
    - `{{baseUrl}}/api/back_office/acquirers` and `{{baseUrl}}/api/back_office/outlets`
      - Added `merchant` sub-object, with field `id` and `name`
    - `{{baseUrl}}/api/merchant_staff/transactions`
      - Added `outlet` sub-object under `agent`
      - Added `acquirer` share information 
  - __Validator Changes__
    - Changed validator in create and refund transaction
      - Field `amount`
        - Must be in positive integer up to `Number.MAX_SAFE_INTEGER` (9007199254740991)
        - Still accept fixed point style number (eg "100.00")
    - Change validator for login (`{{baseUrl}}/api/auth/login`)
      - `username` Only accept string
      - `password` Only accept string
    - Changed validator for change password
      - `oldPassword` does not have minimum length anymore
    - Changed validator for for create and update user
      - `password` minimum length is 8 character
    - Changed validator for create and update acquirer
      - `minimumAmount` is now nullable
    - Changed validator for create and update agent
      - `generalLocationLong` is now nullable
      - `generalLocationLat` is now nullable
      - `generalLocationRadiusMeter` is now nullable
    - Changed to nullable validator for create and update merchant staff
      - `locationLong` is now nullable
      - `locationLat` is now nullable
  - __New transaction method__
    - Transaction cancellation
    - Transaction refund and partial refund
  - __Transaction status__
    - Changed `failed` to `expired` for expired transaction
    - Added `canceled` status for explicitly cancelled transaction
    - Added `refunded` and `partialRefunded`
    - Removed `pending`
  - __Changed `transactionId` generation from KSUID to ULID method__
  - __New `tcashqrn` acquirer handler__ : an implementation of QRIS (Quick Response Indonesian Standard)
  - __New `kumapay` acquirer handler__ : a fictitious acquirer for testing purposes
  - __`midtrans` acquirer handler and library__
    - Added `cancelHandler`
    - Added `refundHandler`
    - Added `forceStatusUpdateHandler`
    - Added correct handling for `status_code` response
    - Changed default notif endpoint to `/acquirer_notif/midtrans`
    - Major refactor in all handler
    - Refactor in `aqMidtrans` library
    - Added custom field in charge request
  - __`tcash` acquirer handler and library__
    - Minor refactor in library
  - __`alto` acquirer handler and library__
    - Fixed invalid flow properties, from `GET_TOKEN` to `PROVIDE_TOKEN`
    - Changed default notif endpoint to `/acquirer_notif/alto`
    - Minor refactor in library
  - Added `transactionExpired` events in push notification (`notif`)
  - Changed `core` morgan log to display real ip address (via `x-real-ip` http header)
  - Fixed query filter (`f[]`) validator in `getMerchantStaffsMiddlewares`,`getAdminsMiddlewares` used string instead of array
### More details
  - Push Notification
    - Added new field `brokerUrlAlt` for alternative broker URL in `brokerDetails`
  - Transaction manager
    - Moved config out from `commonConfig` into standalone `trxManagerConfig`
    - Fixed invalid minimum and maximum amount detection in create transaction
      because of casting error
    - Major refactor in `trxManager`
      - Replaced nodejs owns `EventEmitter` with `EventEmitter2` for async support (see on read-after-write)
    - Moved `errorToMsgTypes` - as helper for controllers
    - Replaced `forceStatus` with `forceStatusUpdate` that will call `forceStatusUpdateHandler` 
      on corresponded acquirer handler, Intended for synchronized update with acquirer host
    - Types (`trxManagerTypes`)
      - Added new error types
        - `INVALID_TRANSACTION_ON_ACQUIRER_HOST`
        - `INVALID_REFUND_AMOUNT`
        - `ACQUIRER_UNABLE_TO_PROCESS`
        - `VOID_NOT_SUPPORTED`
        - `REFUND_NOT_SUPPORTED`
        - `PARTIAL_REFUND_NOT_SUPPORTED`
      - Changed error types
        - `ACQUIRER_NOT_RESPONDING` to `ACQUIRER_HOST_UNAVAILABLE` 
        - `ACQUIRER_UNABLE_TO_PROCESS` to `ACQUIRER_HOST_UNABLE_TO_PROCESS`
      - Removed unused error types
        - `NEED_EXTRA_CONFIG`
        - `ID_ALIAS_GENERATION_ERROR`
  - Message types and event types
    - Fixed missing `isError` on many error message types
    - Change `message` in several message types
    - Changed transaction context (trx-*) status code allocation
      - `trx-50*` is intended for server error
      - `trx-51*` is intended for acquirer host error
    - Changed message type
      - Fixed duplicate status on `MSG_ERROR_BAD_REQUEST_UNIQUE_CONSTRAINT` and `MSG_ERROR_BAD_REQUEST_FOREIGN_KEY_PARENT`
        - Changed `MSG_ERROR_BAD_REQUEST_UNIQUE_CONSTRAINT` status to `sys-409`
      - `MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD` to `MSG_ERROR_AUTH_CANNOT_CHANGE_PASSWORD_INVALID_OLD_PASSWORD`
      - `MSG_ERROR_TRANSACTION_ACQUIRER_NOT_RESPONDING` to `MSG_ERROR_TRANSACTION_ACQUIRER_HOST_UNAVAILABLE` 
        - Changed status code from `trx-501` to `trx-510`
    - Added new message types
      - `MSG_SUCCESS_TRANSACTION_CANCELED`
      - `MSG_SUCCESS_TRANSACTION_VOIDED`
      - `MSG_SUCCESS_TRANSACTION_REFUNDED`
      - `MSG_SUCCESS_TRANSACTION_PARTIALLY_REFUNDED`
      - `MSG_ERROR_TRANSACTION_VOID_NOT_SUPPORTED`
      - `MSG_ERROR_TRANSACTION_REFUND_NOT_SUPPORTED`
      - `MSG_ERROR_TRANSACTION_PARTIAL_REFUND_NOT_SUPPORTED`
      - `MSG_ERROR_TRANSACTION_REFUND_INVALID_AMOUNT`
      - `MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG`
      - `MSG_ERROR_TRANSACTION_ACQUIRER_HOST_UNABLE_TO_PROCESS`
      - `MSG_ERROR_TRANSACTION_INVALID_ON_ACQUIRER_HOST`
    - Removed message types
      - `MSG_ERROR_TRANSACTION_UNSUPPORTED_ACQUIRER`
        - Status code `trx-500` is now used by `MSG_ERROR_TRANSACTION_INVALID_ACQUIRER_CONFIG`
    - New event types
      - `EVENT_TRANSACTION_EXPIRED`
  - Error middleware and handling
    - Bad Request Error (`sys-400`) should not create and return `errorRef` in data
  - Simple refactor on `emv.js` 
  - Updated default on `commonConfig.js`

## [3.0.2] - 2019-07-15
  - Changed back `idAlias` to `id` as transaction reference in `midtrans` and `linkaja`
  - Added message status code (e.g trx-400, sys-200) to Core app morgan logs
  - Refactored message status code
  - Changed default CORS config for production environment
  - Changed default value of `authExpirySecond`
  - Added nullable in `createTransactionValidator`

## [3.0.1] - 2019-07-09
  - Package update
  - Changed `transaction.idAlias`
    - Case insensitive collation
    - Generation method
  - Added `transaction` reload in `trxManager.create`
  - Changed `merchant.shortName` to allow null
  - Changed `midtrans` and `linkaja` acquirer handler to use `idAlias` as transaction reference
  - Removed `replication` settings in `dbConfig.js` `production` environment
  - Added error reference in `errorMiddleware.js`
  - Changed and added new design tests for `idAlias`
  - Added vagrant file for standalone development environment
  - Refactored `midtrans`, `linkaja`, and `alto` acquirer handlers
  - Refactored debug controllers
  - Added debug endpoint to generate error
  - Other minors refactor

## [3.0.0] - 2019-07-04
  - Initial release
