'use strict'

const FastestValidator = require('fastest-validator')

const PasswordValidator = require('password-validator')
const PasswordGenerator = require('strict-password-generator').default

const commonConfig = require('../configs/commonConfig')

const defaultFormat = commonConfig.authValidPassword ||
{
  mustContains: ['digits', 'letters'],
  min: 8,
  max: 64,
  generatedLength: 10
}

function validatePasswordFormat (format) {
  const v = new FastestValidator()
  const vResults = v.validate(format, {
    mustContains: {
      type: 'array',
      items: 'string',
      enum: ['digits', 'letters', 'uppercase', 'lowercase', 'symbols']
    },
    min: {
      type: 'number',
      min: 8,
      integer: true,
      positive: true
    },
    max: {
      type: 'number',
      integer: true,
      positive: true
    },
    generatedLength: {
      type: 'number',
      positive: true,
      integer: true
    }
  })
  if (vResults.length) {
    const error = Error(`Password format validation ${vResults.map(val => `\n${val.message}`).join('')}`)
    throw error
  } else {
    if (format.max < format.min) {
      throw Error('\'max\' must be larger than \'min\'')
    }
    if (format.generatedLength <= format.min) {
      throw Error('\'generatedLength\' cannot be smaller than \'min\'')
    }
  }
}

module.exports.createPasswordValidator = (format) => {
  validatePasswordFormat(format)
  const passwordValidator = new PasswordValidator()

  passwordValidator.is().min(format.min)
  passwordValidator.is().max(format.max)
  if (Array.isArray(format.mustContains)) {
    format.mustContains.forEach(rule => {
      passwordValidator.is()
      passwordValidator[rule]()
    })
  }

  return passwordValidator
}

module.exports.createPasswordGenerator = (format) => {
  validatePasswordFormat(format)
  const passwordGenerator = new PasswordGenerator()
  const options = {
    upperCaseAlpha: true,
    lowerCaseAlpha: true,
    number: true,
    specialCharacter: false,
    exactLength: format.generatedLength
  }

  return {
    passwordGenerator,
    generate (humane) {
      if (humane) {
        // TODO: Implement humane password based on diceware
        return this.passwordGenerator.generatePassword(options)
      }
      return this.passwordGenerator.generatePassword(options)
    }
  }
}

module.exports.standardPasswordValidator =
  exports.createPasswordValidator(defaultFormat)

module.exports.standardPasswordGenerator =
  exports.createPasswordGenerator(defaultFormat)
