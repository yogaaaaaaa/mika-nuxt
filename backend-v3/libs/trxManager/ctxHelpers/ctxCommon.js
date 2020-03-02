'use strict'

const keyManager = require('libs/keyManager')
const sessionStore = require('libs/sessionStore')
const { createError } = require('libs/error')
const { lockAgent } = require('../lock')
const { errorTypes } = require('../constants')
const { acquirerHandlers } = require('../handlers')

/**
 * Do agent lock, call ctx.lockDone() to release the lock
 */
module.exports.doAgentLock = async (ctx, agentId) => {
  if (!ctx.lockDone) {
    const lockDoneHandler = await lockAgent(agentId)
    if (!lockDoneHandler) {
      throw createError({
        name: errorTypes.STILL_RUNNING
      })
    }
    ctx.lockDone = lockDoneHandler
  }
}

module.exports.doAcquirerConfig = (ctx) => {
  // Populate acquirer handler
  ctx.acquirerHandler = acquirerHandlers.get(ctx.acquirerConfig.handler)
  if (!ctx.acquirerHandler) {
    throw createError({
      name: errorTypes.INVALID_ACQUIRER_HANDLER
    })
  }

  // Merge acquirerConfig* and terminal config
  ctx.acquirerConfigMerged = {
    ...ctx.acquirerConfig.config || {}
  }
  if (ctx.acquirerConfigOutlet) {
    ctx.acquirerConfigMerged = {
      ...ctx.acquirerConfigMerged,
      ...ctx.acquirerConfigOutlet.config || {}
    }
  }
  if (ctx.acquirerConfigAgent) {
    ctx.acquirerConfigMerged = {
      ...ctx.acquirerConfigMerged,
      ...ctx.acquirerConfigAgent.config || {}
    }
    // merge acquirerTerminal config
    if (ctx.acquirerConfigAgent.acquirerTerminal) {
      ctx.acquirerConfigMerged = {
        ...ctx.acquirerConfigMerged,
        ...ctx.acquirerConfigAgent.acquirerTerminal.config
      }
      if (ctx.acquirerConfigAgent.acquirerTerminal.acquirerTerminalCommon) {
        ctx.acquirerConfigMerged = {
          ...ctx.acquirerConfigMerged,
          ...ctx.acquirerConfigAgent.acquirerTerminal.acquirerTerminalCommon.config
        }
      }
    }
  }
}

module.exports.doEncryptionKey = async (ctx) => {
  if (ctx.acquirerHandler.useDek) {
    const keyBox = await keyManager.getKey()
    if (keyBox) {
      ctx.dekKeyBox = keyBox
      ctx.dekBuffer = Buffer.from(keyBox.k, 'base64')
    } else {
      throw createError({ name: errorTypes.SYSTEM_NOT_INIT })
    }
  }
  // ctx.userDekBuffer = Buffer.from(await sessionStore.get(ctx.agent.userId, 'userDek'), 'base64')
  const sessionUserDek = await sessionStore.get(ctx.agent.userId, 'sessionUserDek')
  if (sessionUserDek) {
    ctx.sessionUserDekBuffer = Buffer.from(sessionUserDek, 'base64')
  }
}

module.exports.doHandlerTimeStart = (ctx) => {
  ctx.handlerTimeMs = new Date().getTime()
}

module.exports.doHandlerTimeEnd = (ctx) => {
  ctx.handlerTimeMs = (new Date().getTime()) - ctx.handlerTimeMs
}

module.exports.doHandlerCall = async (ctx, handlerFuncName, mandatory = true) => {
  const timeExist = !!ctx.handlerTimeMs
  let error
  if (!timeExist) exports.doHandlerTimeStart(ctx)
  try {
    if (
      !mandatory &&
      typeof ctx.acquirerHandler[handlerFuncName] !== 'function'
    ) {
      return
    }
    // handler call
    await ctx.acquirerHandler[handlerFuncName](ctx)
  } catch (err) {
    // decorate error
    err.data = {
      handler: ctx.acquirerHandler.name,
      handlerError: err.data || undefined
    }
    error = err
  }
  if (!timeExist) exports.doHandlerTimeEnd(ctx)
  if (error) throw error
}

module.exports.doHandlerCallAndIgnoreError = async (ctx, handlerFuncName) => {
  const timeExist = !!ctx.handlerTimeMs
  if (!timeExist) exports.doHandlerTimeStart(ctx)
  try {
    // handler call
    await ctx.acquirerHandler[handlerFuncName](ctx)
  } catch (err) {} // ignore error
  if (!timeExist) exports.doHandlerTimeEnd(ctx)
}

module.exports.doAgentTraceNumber = async (ctx, t) => {
  // This handler need new trace number ?
  if (ctx.acquirerHandler.useTraceNumber) {
    ctx.agent.incrementTraceCounter()
    await ctx.agent.save({ transaction: t })
  }
}

module.exports.doResult = async (ctx, result) => {
  ctx.result = {
    handler: ctx.acquirerHandler.name,
    handlerResponse: ctx.handlerResponse,
    handlerTimeMs: ctx.handlerTimeMs,
    handlerFailed: ctx.handlerFailed,
    ...result
  }
}
