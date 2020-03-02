'use strict'

const _ = require('lodash')

const msg = require('libs/msg')
const models = require('models')
const validator = require('validator')

const queryToSequelizeMiddleware = require('middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('middlewares/errorMiddleware')

function processCrudCtxOption (option, callbackParam, defaultValue) {
  if (typeof option === 'function') {
    return option(callbackParam)
  } else {
    return defaultValue || option
  }
}

function processCrudCtxModelScope (modelScope, callbackParam) {
  if (Array.isArray(modelScope)) {
    const processedModelScope = []
    for (const scope of modelScope) {
      if (typeof scope === 'function') {
        processedModelScope.push(scope(callbackParam))
      } else {
        processedModelScope.push(scope)
      }
    }
    return _.flatten(processedModelScope)
  } else if (typeof modelScope === 'function') {
    return modelScope(callbackParam)
  } else {
    return modelScope
  }
}

function processCrudCtxIdentifier (source, sourceObject) {
  const value = _.get(sourceObject, source.path)
  let valid = false
  let available = false

  if (value !== undefined) {
    available = true
    if (source.type === 'int') {
      valid = validator.isInt(value)
    } else {
      valid = true
    }
  }

  return {
    available,
    value,
    valid
  }
}

function createMiddlewares ({
  validatorErrorHandlerParam,
  sequelizeErrorHandlerParam,
  errorHandlerParam,
  controller,
  validatorMiddlewares = [],
  postValidatorMiddlewares = [],
  postControllerMiddlewares = []
}) {
  if (validatorErrorHandlerParam || validatorMiddlewares.length > 0) {
    validatorMiddlewares.push(
      errorMiddleware.validatorErrorHandler
    )
  }
  if (sequelizeErrorHandlerParam) {
    postControllerMiddlewares.push(
      errorMiddleware.sequelizeErrorHandler
    )
  }
  if (errorHandlerParam) {
    postControllerMiddlewares.push(
      errorMiddleware.errorHandler(errorHandlerParam.errorMap)
    )
  }

  return [
    validatorMiddlewares,
    postValidatorMiddlewares,
    controller,
    postControllerMiddlewares
  ]
}

function createCrudCtx ({
  req,
  res,
  modelName,
  modelOptions = {},
  modelScope = undefined,
  modelScopeResponse = undefined,
  dataSource = undefined,
  identifierSource = undefined
}) {
  const crudCtx = {
    msg: msg,
    models: models,
    validator: validator,

    modelName: undefined,
    modelOptions: undefined,
    modelScope: undefined,
    modelScopeResponse: undefined,

    model: undefined,
    modelScoped: undefined,
    modelScopedResponse: undefined,

    modelInstance: undefined,

    local: {},

    identifierAvailable: false,
    identifierValid: undefined,

    secondaryIdentifierAvailable: false,
    secondaryIdentifierValid: undefined,

    data: undefined,

    msgType: msg.msgTypes.MSG_SUCCESS,
    response: undefined,
    responseMeta: undefined
  }

  crudCtx.getIdentifier = (source) => {
    const identifier = processCrudCtxIdentifier(source, req)

    if (identifier.available) {
      crudCtx.identifierAvailable = true
      crudCtx.identifierValid = crudCtx.identifierValid === undefined
        ? identifier.valid
        : crudCtx.identifierValid && identifier.valid
    }

    return identifier.value
  }

  crudCtx.getSecondaryIdentifier = (source) => {
    const identifier = processCrudCtxIdentifier(source, req)

    if (identifier.available) {
      crudCtx.secondaryIdentifierAvailable = true
      crudCtx.secondaryIdentifierValid = crudCtx.secondaryIdentifierValid === undefined
        ? identifier.valid
        : crudCtx.secondaryIdentifierValid && identifier.valid
    }

    return identifier.value
  }

  crudCtx.modelName = processCrudCtxOption(modelName, { crudCtx, req, res })
  crudCtx.modelOptions = processCrudCtxOption(modelOptions, { crudCtx, req, res })
  crudCtx.modelScope = processCrudCtxModelScope(modelScope, { crudCtx, req, res })
  crudCtx.modelScopeResponse = processCrudCtxModelScope(modelScopeResponse, { crudCtx, req, res })

  if (_.isPlainObject(identifierSource)) identifierSource = [identifierSource]
  if (Array.isArray(identifierSource)) {
    if (identifierSource.length > 0) {
      if (!crudCtx.modelOptions.where) crudCtx.modelOptions.where = {}
      for (const source of identifierSource) {
        const identifier = processCrudCtxIdentifier(source, req)
        if (identifier.available) {
          crudCtx.identifierAvailable = true
          crudCtx.identifierValid = crudCtx.identifierValid === undefined
            ? identifier.valid
            : crudCtx.identifierValid && identifier.valid
          crudCtx.modelOptions.where[source.as] = identifier.value
        }
      }
    }
  }

  crudCtx.data = processCrudCtxOption(dataSource, { crudCtx, req, res }, _.get(req, dataSource))

  crudCtx.model = models[crudCtx.modelName]
  crudCtx.modelScoped = crudCtx.modelScope
    ? crudCtx.model.scope(crudCtx.modelScope)
    : crudCtx.model.scope()
  crudCtx.modelScopedResponse = crudCtx.modelScopeResponse
    ? crudCtx.model.scope(crudCtx.modelScopeResponse)
    : crudCtx.model.scope()

  return crudCtx
}

module.exports.generateCreateEntityController = ({
  modelName,
  modelScope = undefined,
  modelScopeResponse = undefined,
  modelOptions = undefined,
  dataSource = 'body',

  createHandler = undefined,
  findBackHandler = undefined,
  responseHandler = undefined,

  validatorErrorHandlerParam = {},
  sequelizeErrorHandlerParam = {},
  errorHandlerParam = undefined
}) => {
  const controller = async (req, res, next) => {
    const crudCtx = createCrudCtx({
      req,
      res,
      modelName,
      modelScope,
      modelScopeResponse,
      modelOptions,
      dataSource
    })
    crudCtx.msgType = undefined

    await models.sequelize.transaction(async t => {
      crudCtx.t = t
      crudCtx.modelOptions.transaction = t

      crudCtx.data.archivedAt = undefined

      if (typeof createHandler === 'function') {
        await createHandler({ crudCtx, req, res })
      } else {
        crudCtx.modelInstance = await crudCtx.modelScoped.create(crudCtx.data, crudCtx.modelOptions)
      }

      if (typeof findBackHandler === 'function') {
        await findBackHandler({ crudCtx, req, res })
      } else {
        if (crudCtx.modelInstance) {
          const modelScoped = crudCtx.modelScopeResponse
            ? crudCtx.modelScopedResponse
            : crudCtx.modelScoped
          crudCtx.modelInstance = await modelScoped.findByPk(
            crudCtx.modelInstance.id,
            crudCtx.modelOptions
          )
        }
      }

      if (typeof responseHandler === 'function') {
        await responseHandler({ crudCtx, req, res })
      } else {
        crudCtx.response = crudCtx.modelInstance
      }
    })

    if (crudCtx.msgType) {
      msg.expressResponse(
        res,
        crudCtx.msgType,
        crudCtx.response,
        crudCtx.responseMeta
      )
      return
    }

    msg.expressCreateEntityResponse(
      res,
      crudCtx.response
    )
  }

  return createMiddlewares({
    validatorErrorHandlerParam,
    sequelizeErrorHandlerParam,
    errorHandlerParam,
    controller
  })
}

module.exports.generateReadEntityController = ({
  modelName,
  modelScope = undefined,
  modelOptions = undefined,
  identifierSource = undefined,
  onlySingleRead = false,

  responseHandler = undefined,

  validatorErrorHandlerParam = {},
  sequelizeErrorHandlerParam = {},
  errorHandlerParam = undefined,

  sequelizeFilterScopeParam = undefined,
  sequelizeCommonScopeParam = undefined,
  sequelizePaginationScopeParam = undefined
}) => {
  const validatorMiddlewares = []
  const postValidatorMiddlewares = []

  if (sequelizeCommonScopeParam) {
    validatorMiddlewares.push(
      queryToSequelizeMiddleware.commonValidator
    )
    postValidatorMiddlewares.push(
      queryToSequelizeMiddleware.common
    )
  }
  if (sequelizePaginationScopeParam) {
    validatorMiddlewares.push(
      queryToSequelizeMiddleware.paginationValidator(
        sequelizePaginationScopeParam.validModels,
        sequelizePaginationScopeParam.bannedFields,
        sequelizePaginationScopeParam.acceptedFields
      )
    )
    postValidatorMiddlewares.push(
      queryToSequelizeMiddleware.pagination
    )
  }
  if (sequelizeFilterScopeParam) {
    validatorMiddlewares.push(
      queryToSequelizeMiddleware.filterValidator(
        sequelizeFilterScopeParam.validModels,
        sequelizeFilterScopeParam.bannedFields,
        sequelizeFilterScopeParam.acceptedFields
      )
    )
    postValidatorMiddlewares.push(
      queryToSequelizeMiddleware.filter
    )
  }

  const controller = async (req, res, next) => {
    const crudCtx = createCrudCtx({
      req,
      res,
      modelName,
      modelScope,
      modelOptions,
      identifierSource
    })

    const applySequelizeCommonScopeExist = typeof req.applySequelizeCommonScope === 'function'
    const applySequelizePaginationScopeExist = typeof req.applySequelizePaginationScope === 'function'
    const applySequelizeFilterScopeExist = typeof req.applySequelizeFilterScope === 'function'

    if (applySequelizeCommonScopeExist) {
      crudCtx.modelScoped = req.applySequelizeCommonScope(crudCtx.modelScoped)
    }

    if (crudCtx.secondaryIdentifierAvailable ? crudCtx.secondaryIdentifierValid : true) {
      if (crudCtx.identifierAvailable && crudCtx.identifierValid) {
        crudCtx.modelInstance = await crudCtx.modelScoped.findOne(crudCtx.modelOptions)
      } else if (!crudCtx.identifierAvailable && !onlySingleRead) {
        if (applySequelizeFilterScopeExist) {
          crudCtx.modelScoped = req.applySequelizeFilterScope(crudCtx.modelScoped)
        }
        if (applySequelizePaginationScopeExist) {
          crudCtx.modelScoped = req.applySequelizePaginationScope(crudCtx.modelScoped)
        }

        if (applySequelizePaginationScopeExist && req.query.get_count) {
          crudCtx.modelInstance = await crudCtx.modelScoped.findAndCountAll(modelOptions)
          crudCtx.pagination = {
            count: crudCtx.modelInstance.count,
            page: req.query.page,
            perPage: req.query.per_page
          }
          crudCtx.modelInstance = crudCtx.modelInstance.rows
        } else {
          crudCtx.modelInstance = await crudCtx.modelScoped.findAll(modelOptions)
        }
      }

      if (typeof responseHandler === 'function') {
        responseHandler({ crudCtx, req, res })
      } else {
        crudCtx.response = crudCtx.modelInstance
      }
    }

    if (crudCtx.pagination) {
      msg.expressGetEntityResponse(
        res,
        crudCtx.response,
        crudCtx.pagination.count,
        crudCtx.pagination.page,
        crudCtx.pagination.perPage
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        crudCtx.response
      )
    }
  }

  return createMiddlewares({
    validatorErrorHandlerParam,
    sequelizeErrorHandlerParam,
    errorHandlerParam,
    controller,
    validatorMiddlewares,
    postValidatorMiddlewares
  })
}

module.exports.generateUpdateEntityController = ({
  modelName,
  modelScope = undefined,
  modelScopeResponse = undefined,
  modelOptions = undefined,
  dataSource = 'body',
  paranoid = false,
  identifierSource = undefined,

  preUpdateHandler = undefined,
  updateHandler = undefined,
  postUpdateHandler = undefined,
  findBackHandler = undefined,
  responseHandler = undefined,

  validatorErrorHandlerParam = {},
  sequelizeErrorHandlerParam = {},
  errorHandlerParam = undefined
}) => {
  const controller = async (req, res, next) => {
    const crudCtx = createCrudCtx({
      req,
      res,
      modelName,
      modelScope,
      modelScopeResponse,
      modelOptions,
      identifierSource,
      dataSource
    })
    crudCtx.msgType = undefined
    crudCtx.updated = false

    if (crudCtx.secondaryIdentifierAvailable ? crudCtx.secondaryIdentifierValid : true) {
      if (crudCtx.identifierAvailable && crudCtx.identifierValid) {
        await models.sequelize.transaction(async t => {
          crudCtx.t = t
          crudCtx.modelOptions.transaction = t
          crudCtx.modelOptions.returning = false
          if (paranoid !== undefined) crudCtx.modelOptions.paranoid = paranoid

          crudCtx.modelInstance = await crudCtx.modelScoped.findOne(crudCtx.modelOptions)

          if (crudCtx.modelInstance) {
            if (typeof preUpdateHandler === 'function') {
              await preUpdateHandler({ crudCtx, req, res })
            }

            if (crudCtx.data.archivedAt !== undefined) {
              if (Object.keys(crudCtx.model.rawAttributes).includes('archivedAt')) {
                crudCtx.modelInstance.setDataValue(
                  'archivedAt',
                  crudCtx.data.archivedAt ? new Date() : null
                )
              }
            }

            if (typeof updateHandler === 'function') {
              await updateHandler({ crudCtx, req, res })
            } else {
              Object.assign(crudCtx.modelInstance, crudCtx.data)
            }

            if (crudCtx.modelInstance.changed()) crudCtx.updated = true
            await crudCtx.modelInstance.save(crudCtx.modelOptions)

            if (typeof postUpdateHandler === 'function') {
              await postUpdateHandler({ crudCtx, req, res })
            }

            if (typeof findBackHandler === 'function') {
              await findBackHandler({ crudCtx, req, res })
            } else {
              if (crudCtx.updated) {
                const modelScoped = crudCtx.modelScopeResponse
                  ? crudCtx.modelScopedResponse
                  : crudCtx.modelScoped
                crudCtx.modelInstance = await modelScoped.findByPk(
                  crudCtx.modelInstance.id,
                  crudCtx.modelOptions
                )
              }
            }

            if (typeof responseHandler === 'function') {
              await responseHandler({ crudCtx, req, res })
            } else {
              crudCtx.response = crudCtx.modelInstance
            }
          }
        })
      }
    }

    if (crudCtx.msgType) {
      msg.expressResponse(
        res,
        crudCtx.msgType,
        crudCtx.response,
        crudCtx.responseMeta
      )
      return
    }

    msg.expressUpdateEntityResponse(
      res,
      crudCtx.updated,
      crudCtx.response,
      !!crudCtx.modelInstance
    )
  }
  return createMiddlewares({
    validatorErrorHandlerParam,
    sequelizeErrorHandlerParam,
    errorHandlerParam,
    controller
  })
}

module.exports.generateDeleteEntityController = ({
  modelName,
  modelScope = undefined,
  modelOptions = undefined,
  paranoid = false,
  force = true,
  identifierSource = undefined,

  postDeleteHandler = undefined,

  validatorErrorHandlerParam = {},
  sequelizeErrorHandlerParam = {},
  errorHandlerParam = undefined
}) => {
  const controller = async (req, res, next) => {
    const crudCtx = createCrudCtx({
      req,
      res,
      modelName,
      modelScope,
      modelOptions,
      identifierSource
    })
    crudCtx.msgType = undefined

    if (crudCtx.secondaryIdentifierAvailable ? crudCtx.secondaryIdentifierValid : true) {
      if (crudCtx.identifierAvailable && crudCtx.identifierValid) {
        await models.sequelize.transaction(async t => {
          crudCtx.t = t
          crudCtx.modelOptions.transaction = t
          if (paranoid !== undefined) crudCtx.modelOptions.paranoid = paranoid
          if (force !== undefined) crudCtx.modelOptions.force = force

          crudCtx.modelInstance = await crudCtx.modelScoped.findOne(crudCtx.modelOptions)

          if (crudCtx.modelInstance) {
            await crudCtx.modelInstance.destroy(crudCtx.modelOptions)
          }

          if (typeof postDeleteHandler === 'function') {
            await postDeleteHandler({ crudCtx, req, res })
          }
        })
      }
    }

    if (crudCtx.msgType) {
      msg.expressResponse(
        res,
        crudCtx.msgType,
        crudCtx.response,
        crudCtx.responseMeta
      )
      return
    }

    msg.expressDeleteEntityResponse(res, crudCtx.modelInstance)
  }
  return createMiddlewares({
    validatorErrorHandlerParam,
    sequelizeErrorHandlerParam,
    errorHandlerParam,
    controller
  })
}

module.exports.generateActionEntityController = ({
  modelName,
  modelScope = undefined,
  modelOptions = undefined,
  identifierSource = undefined,
  paranoid = undefined,
  dataSource = 'body',
  actionHandler = undefined,

  validatorErrorHandlerParam = {},
  sequelizeErrorHandlerParam = {},
  errorHandlerParam = undefined
}) => {
  const controller = async (req, res, next) => {
    const crudCtx = createCrudCtx({
      req,
      res,
      modelName,
      modelScope,
      modelOptions,
      identifierSource,
      dataSource
    })

    if (crudCtx.secondaryIdentifierAvailable ? crudCtx.secondaryIdentifierValid : true) {
      if (crudCtx.identifierAvailable && crudCtx.identifierValid) {
        await models.sequelize.transaction(async t => {
          crudCtx.t = t
          crudCtx.modelOptions.transaction = t
          if (paranoid !== undefined) crudCtx.modelOptions.paranoid = paranoid

          crudCtx.modelInstance = await crudCtx.modelScoped.findOne(crudCtx.modelOptions)

          if (typeof actionHandler === 'function' && crudCtx.modelInstance) {
            await actionHandler({ crudCtx, req, res })
          }
        })
      }
    }

    if (crudCtx.modelInstance) {
      msg.expressResponse(res,
        crudCtx.msgType,
        crudCtx.response,
        crudCtx.responseMeta
      )
    } else {
      msg.expressResponse(res, msg.msgTypes.MSG_ERROR_ENTITY_NOT_FOUND)
    }
  }
  return createMiddlewares({
    validatorErrorHandlerParam,
    sequelizeErrorHandlerParam,
    errorHandlerParam,
    controller
  })
}
