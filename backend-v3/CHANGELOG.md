# Version 3.0.0 (2019-07-04)
  - Initial release
# Version 3.0.1 (2019-07-09)
  - Package update
  - Changed `transaction.idAlias`
    - Case insensitive collation
    - Generation method
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
# Version 3.0.2 (2019-07-15)
  - Changed back `idAlias` to `id` as transaction reference in `midtrans` and `linkaja`
  - Added message status code (e.g trx-400, sys-200) to Core app morgan logs
  - Refactored message status code
  - Changed default CORS config for production environment
  - Changed default session token expiry