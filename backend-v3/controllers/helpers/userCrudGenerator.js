'use strict'

const auth = require('libs/auth')
const crudGenerator = require('./crudGenerator')

function scopeDefaultIncludeUser (modelScope) {
  const scopeIncludeUser = ({ crudCtx }) => {
    return {
      include: [crudCtx.models.user]
    }
  }

  if (modelScope !== undefined) {
    modelScope = [
      scopeIncludeUser,
      modelScope
    ]
  } else {
    modelScope = scopeIncludeUser
  }
  return modelScope
}

/**
 * Generate resetUser controller for specified model that include user (e.g 'admin', 'agent')
 */
module.exports.generateResetUserPasswordController = ({ modelName, identifierSource }) => {
  return [
    crudGenerator.generateActionEntityController({
      modelName,
      modelScope: ({ crudCtx }) => ({
        attributes: ['id'],
        include: [
          crudCtx.models.user
        ],
        paranoid: false
      }),
      identifierSource,
      actionHandler: async ({ crudCtx, req }) => {
        crudCtx.local.generatedPassword = await auth.resetPassword(
          crudCtx.modelInstance.user,
          !!req.query.humane_password
        )

        await crudCtx.modelInstance.user.save()

        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_SUCCESS_AUTH_PASSWORD_RESET
        crudCtx.response = {
          userId: crudCtx.modelInstance.user.id,
          username: crudCtx.modelInstance.user.username,
          password: crudCtx.local.generatedPassword
        }
      }
    })
  ]
}

module.exports.generateCreateUserController = (
  {
    modelName,
    modelScope = undefined,
    modelScopeResponse = undefined
  }
) => {
  return [
    crudGenerator.generateCreateEntityController({
      modelName,
      modelScope,
      modelScopeResponse,
      createHandler: async ({ crudCtx, req }) => {
        crudCtx.local.user = crudCtx.models.user.build(crudCtx.data.user)
        crudCtx.local.generatedPassword = await auth.resetPassword(
          crudCtx.local.user,
          !!req.query.humane_password
        )
        await crudCtx.local.user.save({ transaction: crudCtx.t })

        crudCtx.modelInstance = crudCtx.modelScoped.build(crudCtx.data)
        crudCtx.modelInstance.userId = crudCtx.local.user.id
        await crudCtx.modelInstance.save(crudCtx.modelOptions)

        crudCtx.modelInstance = await crudCtx.modelScoped.findByPk(
          crudCtx.modelInstance.id,
          crudCtx.modelOptions
        )
      },
      responseHandler: async ({ crudCtx }) => {
        crudCtx.response = crudCtx.modelInstance.toJSON()
        crudCtx.response.user.password = crudCtx.local.generatedPassword
      }
    })
  ]
}

module.exports.generateUpdateUserController = (
  {
    modelName,
    modelScope = undefined,
    modelScopeResponse = undefined,
    identifierSource = undefined
  }
) => {
  modelScope = scopeDefaultIncludeUser(modelScope)
  return [
    crudGenerator.generateUpdateEntityController({
      modelName,
      modelScope,
      modelScopeResponse,
      identifierSource,
      preUpdateHandler: async ({ crudCtx }) => {
        if (crudCtx.data.user && crudCtx.modelInstance.user) {
          Object.assign(crudCtx.modelInstance.user, crudCtx.data.user)
          await auth.checkPasswordUpdate(crudCtx.modelInstance.user)
          delete crudCtx.data.user

          if (crudCtx.modelInstance.user.changed()) crudCtx.updated = true
          await crudCtx.modelInstance.user.save(crudCtx.modelOptions)
        }
      },
      postUpdateHandler: async ({ crudCtx }) => {
        await auth.removeAuthByUserId(crudCtx.modelInstance.userId)
      }
    })
  ]
}

module.exports.generateDeleteUserController = (
  {
    modelName,
    modelScope = undefined,
    force = true,
    identifierSource = undefined
  }
) => {
  modelScope = scopeDefaultIncludeUser(modelScope)
  return [
    crudGenerator.generateDeleteEntityController({
      modelName,
      modelScope,
      force,
      identifierSource,
      postDeleteHandler: async ({ crudCtx }) => {
        if (crudCtx.modelInstance.user) {
          await crudCtx.modelInstance.user.destroy(crudCtx.modelOptions)
        }
        await auth.removeAuthByUserId(crudCtx.modelInstance.userId)
      }
    })
  ]
}
