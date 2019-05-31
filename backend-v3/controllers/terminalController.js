'use strict'

const msg = require('../libs/msg')
const models = require('../models')
const cipherbox = require('../libs/cipherbox')

const queryToSequelizeMiddleware = require('../middlewares/queryToSequelizeMiddleware')
const errorMiddleware = require('../middlewares/errorMiddleware')

const terminalValidator = require('../validators/terminalValidator')

/**
 * Generate terminal key (cipherbox key) for certain terminal
 */
module.exports.generateTerminalCbKey = async (req, res, next) => {
  let cb3Key = await cipherbox.generateCb3Key()

  await models.sequelize.transaction(async t => {
    await models.cipherboxKey.destroy({
      where: {
        terminalId: req.params.terminalId
      },
      transaction: t
    })
    await models.cipherboxKey.create({
      id: cb3Key.id,
      keys: JSON.stringify(cb3Key),
      status: cipherbox.keyStatuses.ACTIVATED,
      terminalId: req.params.terminalId
    }, { transaction: t })
  })

  msg.expressResponse(
    res,
    msg.msgTypes.MSG_SUCCESS,
    cb3Key
  )
}

module.exports.createTerminal = async (req, res, next) => {
  let terminal

  terminal = await models.terminal.create(req.body)

  msg.expressCreateEntityResponse(
    res,
    await models.terminal
      .findByPk(terminal.id)
  )
}

module.exports.getTerminals = async (req, res, next) => {
  let scopedTerminal = req.applySequelizeCommonScope(models.terminal.scope('admin'))
  let query = { where: {} }

  if (req.params.terminalId) {
    query.where.id = req.params.terminalId
    msg.expressGetEntityResponse(
      res,
      await scopedTerminal.findOne(query)
    )
  } else {
    scopedTerminal =
      req.applySequelizeFilterScope(
        req.applySequelizePaginationScope(
          scopedTerminal
        )
      )
    if (req.query.get_count) {
      let terminals = await scopedTerminal.findAndCountAll(query)
      msg.expressGetEntityResponse(
        res,
        terminals.rows,
        terminals.count,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        await scopedTerminal.findAll(query)
      )
    }
  }
}

module.exports.updateTerminal = async (req, res, next) => {
  let scopedTerminal = models.terminal.scope('admin', 'paranoid')
  let terminal

  let updated = false
  let found = false

  await models.sequelize.transaction(async t => {
    terminal = await scopedTerminal.findByPk(req.params.terminalId, { transaction: t })
    if (terminal) {
      found = true

      Object.assign(terminal, req.body)

      if (req.body.archivedAt === true || req.body.archivedAt === false) {
        terminal.setDataValue('archivedAt', req.body.archivedAt ? new Date() : null)
      }

      if (terminal.changed()) updated = true
      await terminal.save({ transaction: t })
    }
  })

  if (updated) {
    terminal = await scopedTerminal.findByPk(req.params.terminalId)
  }

  msg.expressUpdateEntityResponse(
    res,
    updated,
    terminal,
    found
  )
}

module.exports.deleteTerminal = async (req, res, next) => {
  let scopedTerminal = models.terminal.scope('paranoid')
  let terminal

  await models.sequelize.transaction(async t => {
    terminal = await scopedTerminal.findByPk(req.params.terminalId, { transaction: t })
    if (terminal) await terminal.destroy({ force: true, transaction: t })
  })

  msg.expressDeleteEntityResponse(
    res,
    terminal,
    terminal
  )
}

module.exports.createTerminalMiddlewares = [
  terminalValidator.bodyCreate,
  errorMiddleware.validatorErrorHandler,
  exports.createTerminal,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.updateTerminalMiddlewares = [
  terminalValidator.bodyUpdate,
  errorMiddleware.validatorErrorHandler,
  exports.updateTerminal,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.getTerminalsMiddlewares = [
  queryToSequelizeMiddleware.commonValidator,
  queryToSequelizeMiddleware.paginationValidator(['terminal']),
  queryToSequelizeMiddleware.filterValidator(['terminal', 'terminalModel']),
  errorMiddleware.validatorErrorHandler,
  queryToSequelizeMiddleware.pagination,
  queryToSequelizeMiddleware.filter,
  queryToSequelizeMiddleware.common,
  exports.getTerminals
]

module.exports.generateTerminalCbKeyMiddlewares = [
  module.exports.generateTerminalCbKey,
  errorMiddleware.sequelizeErrorHandler
]

module.exports.deleteTerminalMiddlewares = [
  module.exports.deleteTerminal,
  errorMiddleware.sequelizeErrorHandler
]
