'use strict'

/**
 * Method generator for key-value (entity attribute value) in models
 */

module.exports.selfKvGetter = (kvsParamName) => {
  return function () {
    let config = {}
    if (Array.isArray(this[kvsParamName])) {
      for (const data of this[kvsParamName]) {
        config[data.name] = data.value
      }
      return config
    }
  }
}

module.exports.selfKvLoad = (kvsParamName) => {
  let getName = `get${kvsParamName}`
  return async function (t) {
    this[kvsParamName] = await this[getName](t ? { transaction: t } : undefined)
  }
}

module.exports.selfKvSave = (kvsParamName) => {
  return async function (t) {
    if (Array.isArray(this[kvsParamName])) {
      for (const data of this[kvsParamName]) {
        await data.save(t ? { transaction: t } : undefined)
      }
    }
  }
}

module.exports.setKvMethod = (entityIdName) => {
  return async function (entityId, objectKv, t) {
    await this.destroy({
      where: {
        [entityIdName]: entityId
      }
    }, t ? { transaction: t } : undefined)
    for (const key in objectKv) {
      if (objectKv.hasOwnProperty(key)) {
        await this.create({
          name: key,
          value: objectKv[key]
        }, t ? { transaction: t } : undefined)
      }
    }
  }
}

module.exports.getKvMethod = (models, entityIdName) => {
  return async function (entityId, t) {
    return models.findOne({
      [entityIdName]: entityId
    })
  }
}
