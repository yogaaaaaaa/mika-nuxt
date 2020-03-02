'use strict'

module.exports.environmentInit = (appName) => {
  process.env.DEBUG_HIDE_DATE = true
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'

  console.log('='.repeat(80))
  console.log(`${appName} app environment`)
  console.log(`NODE_ENV is '${process.env.NODE_ENV}'`)
  console.log(`DEBUG is '${process.env.DEBUG || ''}'`)
  console.log(`MIKA_CONFIG_GROUP is '${process.env.MIKA_CONFIG_GROUP || ''}'`)
  console.log('='.repeat(80))
}
