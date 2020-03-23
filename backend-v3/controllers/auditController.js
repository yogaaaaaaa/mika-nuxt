'use strict'

const { storage } = require('libs/auditLog')
const msg = require('libs/msg')

const { query } = require('express-validator')
const validatorHelper = require('validators/helper')
const errorMiddleware = require('middlewares/errorMiddleware')

function mapResponse (response, single) {
  const results = response.hits.hits.map(r => {
    return {
      id: r._id,
      ...r._source
    }
  })
  if (single) {
    return results[0]
  } else {
    return results
  }
}

module.exports.getAudits = async (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  if (req.audit) {
    req.audit.event.type = 'READ'
    req.audit.event.entityName = 'audit'
  }

  if (req.params.auditId) {
    const rawResponse = await storage.getAuditById(req.params.auditId)
    const response = mapResponse(rawResponse, true)
    msg.expressGetEntityResponse(
      res,
      response
    )
    if (req.audit) req.audit.event.entityIds.push(response.id)
  } else {
    const rawResponse = await storage.getAudits({
      page: req.query.page,
      perPage: req.query.per_page,
      orderBy: req.query.order_by,
      order: req.query.order,
      withAudit: req.query.with_audit,
      noUser: req.query.no_user,
      search: req.query.search,
      dateRange: req.query.dates ? req.query.dates.split(',') : undefined
    })

    const response = mapResponse(rawResponse)

    if (req.audit) {
      req.audit.event.entityIds =
        req.audit.event.entityIds.concat(response.map(r => r.id))
    }

    if (req.query.get_count) {
      msg.expressGetEntityResponse(
        res,
        response,
        rawResponse.hits.total.value,
        req.query.page,
        req.query.per_page
      )
    } else {
      msg.expressGetEntityResponse(
        res,
        response
      )
    }
  }
}

module.exports.getAuditsMiddlewares = [
  [
    validatorHelper.paginationValidator,
    query('withAudit').isBoolean().optional(),
    query('noUser').isBoolean().optional(),
    query('search').isString().optional()
  ],
  errorMiddleware.validatorErrorHandler,
  exports.getAudits,
  (err, req, res, next) => {
    if (
      err.status === 400 &&
      err.message.toLowerCase().includes('in order to sort on') // LOL
    ) {
      msg.expressResponse(
        res,
        msg.msgTypes.MSG_ERROR_BAD_REQUEST_VALIDATION,
        [
          'query.order_by'
        ])
    } else {
      next()
    }
  }
]
