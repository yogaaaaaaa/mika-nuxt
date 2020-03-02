'use strict'

const msg = require('../libs/msg')
const models = require('../models')
const cipherbox = require('../libs/cipherbox')

const errorMiddleware = require('../middlewares/errorMiddleware')
const crudGenerator = require('./helpers/crudGenerator')
const terminalValidator = require('validators/terminalValidator')

/**
 * Generate terminal key (cipherbox key) for certain terminal
 */
module.exports.generateTerminalCbKey = async (req, res, next) => {
  const keyBox = await cipherbox.generateCb1Key()

  await models.sequelize.transaction(async t => {
    await models.cipherboxKey.destroy({
      where: {
        terminalId: req.params.terminalId
      },
      transaction: t
    })
    await models.cipherboxKey.create({
      id: keyBox.id,
      keys: JSON.stringify(keyBox),
      status: cipherbox.keyStatuses.ACTIVATED,
      terminalId: req.params.terminalId
    }, { transaction: t })
  })

  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    keyBox
  )
}

module.exports.createTerminalMiddlewares = [
  terminalValidator.bodyCreate,
  crudGenerator.generateCreateEntityController({
    modelName: 'terminal'
  })
]

module.exports.getTerminalsMiddlewares = [
  crudGenerator.generateReadEntityController({
    modelName: 'terminal',
    modelScope: 'admin',
    identifierSource: {
      path: 'params.terminalId',
      as: 'id',
      type: 'int'
    },
    sequelizeCommonScopeParam: {},
    sequelizePaginationScopeParam: {
      validModels: ['terminal']
    },
    sequelizeFilterScopeParam: {
      validModels: ['terminal', 'terminalModel']
    }
  })
]

module.exports.updateTerminalMiddlewares = [
  terminalValidator.bodyUpdate,
  crudGenerator.generateUpdateEntityController({
    modelName: 'terminal',
    identifierSource: {
      path: 'params.terminalId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.deleteTerminalMiddlewares = [
  crudGenerator.generateDeleteEntityController({
    modelName: 'terminal',
    identifierSource: {
      path: 'params.terminalId',
      as: 'id',
      type: 'int'
    }
  })
]

module.exports.generateTerminalCbKeyMiddlewares = [
  module.exports.generateTerminalCbKey,
  errorMiddleware.sequelizeErrorHandler
]
