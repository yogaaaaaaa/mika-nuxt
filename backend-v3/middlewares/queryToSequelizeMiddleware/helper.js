'use strict'

const micromatch = require('micromatch')
const models = require('../../models')
const Sequelize = models.Sequelize

module.exports.validateFieldComponents = (validModels, fieldComps) => {
  if (fieldComps.length > 1) {
    if (
      !models[validModels[0]].associations[fieldComps[0]] || // correct association with top model
      !validModels.includes(fieldComps[0]) // included in valid models
    ) return false
    for (let i = 1; i < fieldComps.length; i++) {
      if (i === fieldComps.length - 1) { // check attributes
        if (!models[fieldComps[i - 1]].rawAttributes.hasOwnProperty(fieldComps[i])) return false // correct property of previous model
        if (models[fieldComps[i - 1]].rawAttributes[fieldComps[i]].type.constructor.name === Sequelize.VIRTUAL.name) return false // property is not virtual
      } else { // check models relation
        if (!validModels.includes(fieldComps[i])) return false // included in valid models
        if (!models[fieldComps[i - 1]].associations[fieldComps[i]]) return false // correct association of previous model
      }
    }
  } else {
    if (!models[validModels[0]].rawAttributes.hasOwnProperty(fieldComps[0])) return false // correct property of top model
    if (models[validModels[0]].rawAttributes[fieldComps[0]].type.constructor.name === Sequelize.VIRTUAL.name) return false // property is not virtual
  }
  return true
}

module.exports.matchFieldPatterns = (field, bannedFields = null, acceptedFields = null) => {
  if (Array.isArray(bannedFields)) {
    if (micromatch.isMatch(field, bannedFields)) return false
  } else if (Array.isArray(acceptedFields)) {
    if (!micromatch.isMatch(field, acceptedFields)) return false
  }
  return true
}
