'use strict'

const FastestValidator = require('fastest-validator')

/**
 * Create fastest-validator express middleware.
 *
 * Optionally, validation `targets` array can be defined to check to other
 * property than `req.body`, e.g `targets = ['body', 'query', 'params]`
 *
 * Any validation result will be placed on `req.fastestValidatorResults`
 */
module.exports.expressCreateValidatorMiddleware = (schema, targets = ['body']) => {
  const validator = new FastestValidator()
  const check = validator.compile(schema)
  return (req, res, next) => {
    req.fastestValidatorResults = {}
    targets.forEach(target => {
      const checkResult = check(req[target])
      if (Array.isArray(checkResult)) req.fastestValidatorResults[target] = checkResult
    })
    next()
  }
}
