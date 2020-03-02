'use strict'

const micromatch = require('micromatch')
const models = require('../../models')
const Sequelize = models.Sequelize

/**
 * Validate field component relation, it returns field property data type
 */
module.exports.validateFieldComponents = (validModels, field) => {
  let fieldPropertyType
  const fieldComps = field.split('.')
  const fieldPropertyComps = fieldComps[fieldComps.length - 1].split('>')
  fieldComps[fieldComps.length - 1] = fieldPropertyComps[0]
  const containJsonb = fieldPropertyComps.length > 1
  if (containJsonb) {
    for (const val of fieldPropertyComps) {
      if (val === '') return false // jsonb property cannot be empty
    }
  }

  if (fieldComps.length > 1) { // nested field
    if (
      !models[validModels[0]].associations[fieldComps[0]] || // correct association with top model
      !validModels.includes(fieldComps[0]) // included in valid models
    ) return false
    for (let i = 1; i < fieldComps.length; i++) {
      if (i === fieldComps.length - 1) { // check attributes/field
        if (!Object.prototype.hasOwnProperty.call(models[fieldComps[i - 1]].rawAttributes, fieldComps[i])) return false // correct property of previous model
        fieldPropertyType = models[fieldComps[i - 1]].rawAttributes[fieldComps[i]].type.constructor.name

        if (fieldPropertyType === 'VIRTUAL') return false // property is not virtual
        if (containJsonb && fieldPropertyType !== 'JSONB') return false // contain jsonb operator but field is not jsonb
      } else { // check models relation
        if (!validModels.includes(fieldComps[i])) return false // included in valid models
        if (!models[fieldComps[i - 1]].associations[fieldComps[i]]) return false // correct association of previous model
      }
    }
  } else { // direct field
    if (!Object.prototype.hasOwnProperty.call(models[validModels[0]].rawAttributes, fieldComps[0])) return false // correct property of top model
    fieldPropertyType = models[validModels[0]].rawAttributes[fieldComps[0]].type.constructor.name

    if (fieldPropertyType === Sequelize.VIRTUAL.name) return false // property is not virtual
    if (containJsonb && fieldPropertyType !== 'JSONB') return false // contain jsonb operator but property is not jsonb
  }
  return fieldPropertyType
}

module.exports.matchFieldPatterns = (field, bannedFields = null, acceptedFields = null) => {
  if (Array.isArray(bannedFields)) {
    if (micromatch.isMatch(field, bannedFields)) return false
  } else if (Array.isArray(acceptedFields)) {
    if (!micromatch.isMatch(field, acceptedFields)) return false
  }
  return true
}
