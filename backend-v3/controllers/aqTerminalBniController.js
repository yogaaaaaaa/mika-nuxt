'use strict'

const { body } = require('express-validator')
const bni = require('libs/aqBni')
const cardCrypto = require('libs/cardCrypto')

const crudGenerator = require('./helpers/crudGenerator')

module.exports.downloadEncryptedLtmkMiddlewares = [
  [
    body('kekSamToken').isString()
  ],
  crudGenerator.generateActionEntityController({
    modelName: 'acquirerTerminal',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    },
    actionHandler: async ({ crudCtx, req }) => {
      if (crudCtx.modelInstance.type !== bni.terminalTypeName) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_INVALID_CONFIG
        return
      }
      const acquirerTerminal = crudCtx.modelInstance

      acquirerTerminal.incrementTraceCounter()
      acquirerTerminal.save({ transaction: crudCtx.t })

      const config = bni.mixConfig({
        ...acquirerTerminal.config,
        mid: acquirerTerminal.mid,
        tid: acquirerTerminal.tid,
        traceNumber: acquirerTerminal.traceNumberCounter,
        nii: acquirerTerminal.config.tle.nii,
        kekSamToken: req.body.kekSamToken
      })

      const response = await bni.downloadEncryptedLtmk(config)
      if (response) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_SUCCESS
        crudCtx.response = {
          encryptedLtmkToken: response.encryptedLtmk
        }
        acquirerTerminal.config.tle.ltmkDownloadAt = new Date().toISOString()
        acquirerTerminal.changed('config', true)
      } else {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_ACQUIRER_HOST_ERROR
        crudCtx.response = undefined
      }
    }
  })
]

module.exports.saveLtmkMiddlewares = [
  [
    body('ltmkToken').isString()
  ],
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerTerminal',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    },
    updateHandler: async ({ crudCtx, req }) => {
      if (crudCtx.modelInstance.type !== bni.terminalTypeName) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_INVALID_CONFIG
        return
      }

      const ltmk = bni.decodeLtmkToken(req.body.ltmkToken)
      if (!ltmk) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_INVALID_TOKEN
        return
      }

      const acquirerTerminal = crudCtx.modelInstance
      acquirerTerminal.config.tle.ltmkID = ltmk.ltmkID
      acquirerTerminal.config.tle.ltmk = ltmk.ltmk
      acquirerTerminal.changed('config', true)
    }
  })
]

module.exports.downloadLtwkMiddlewares = [
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerTerminal',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    },
    updateHandler: async ({ crudCtx, req }) => {
      if (crudCtx.modelInstance.type !== bni.terminalTypeName) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_INVALID_CONFIG
        return
      }

      const acquirerTerminal = crudCtx.modelInstance

      acquirerTerminal.incrementTraceCounter()
      acquirerTerminal.save({ transaction: crudCtx.t })

      const config = bni.mixConfig({
        ...acquirerTerminal.config,
        mid: acquirerTerminal.mid,
        tid: acquirerTerminal.tid,
        traceNumber: acquirerTerminal.traceNumberCounter,
        nii: acquirerTerminal.config.tle.nii
      })

      const response = await bni.downloadLtwk(config)

      if (
        response &&
        response.ltwkToken &&
        response.ltwkToken.dekKcvValid &&
        response.ltwkToken.makKcvValid
      ) {
        acquirerTerminal.config.tle.ltwkID = response.ltwkToken.ltwkID
        acquirerTerminal.config.tle.ltwkDek = response.ltwkToken.ltwkDek
        acquirerTerminal.config.tle.ltwkMak = response.ltwkToken.ltwkMak
        acquirerTerminal.config.tle.ltwkDownloadAt = new Date().toISOString()
        acquirerTerminal.changed('config', true)
      } else {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_ACQUIRER_HOST_ERROR
        crudCtx.response = undefined
      }
    }
  })
]

module.exports.downloadTerminalKeyMiddlewares = [
  crudGenerator.generateUpdateEntityController({
    modelName: 'acquirerTerminal',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.acquirerTerminalId',
      as: 'id',
      type: 'int'
    },
    updateHandler: async ({ crudCtx, req }) => {
      if (crudCtx.modelInstance.type !== bni.terminalTypeName) {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_INVALID_CONFIG
        return
      }

      const acquirerTerminal = crudCtx.modelInstance

      acquirerTerminal.incrementTraceCounter()
      acquirerTerminal.save({ transaction: crudCtx.t })

      const config = bni.mixConfig({
        ...acquirerTerminal.config,
        mid: acquirerTerminal.mid,
        tid: acquirerTerminal.tid,
        traceNumber: acquirerTerminal.traceNumberCounter,
        nii: acquirerTerminal.config.tle.nii
      })

      const masterKeyResponse = await bni.downloadMk(config)
      const workingKeyResponse = await bni.downloadWk(config)
      let masterKey
      let workingKey
      if (masterKeyResponse) {
        masterKey = masterKeyResponse.masterKey
      }
      if (workingKeyResponse) {
        workingKey = workingKeyResponse.workingKey
      }

      if (masterKey && workingKey) {
        acquirerTerminal.config.terminalKeyCredit = {
          masterKey,
          workingKey,
          pinKey: cardCrypto.des.decrypt(masterKey, workingKey),
          downloadAt: new Date().toISOString()
        }
        acquirerTerminal.changed('config', true)
      } else {
        crudCtx.msgType = crudCtx.msg.msgTypes.MSG_ERROR_TERMINAL_MANAGER_ACQUIRER_HOST_ERROR
        crudCtx.response = undefined
      }
    }
  })
]
