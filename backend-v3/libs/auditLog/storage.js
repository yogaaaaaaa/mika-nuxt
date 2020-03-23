'use strict'

const debug = require('debug')('mika:auditLog:storage')

const uid = require('libs/uid')
const auditLogConfig = require('configs/auditLogConfig')
const elasticsearch = require('libs/elasticsearch')

module.exports.search = async (query) => {
  debug('search ', JSON.stringify(query, null, 2))
  const response = await elasticsearch.search({
    index: auditLogConfig.elasticSearchIndex,
    type: '_doc',
    body: query
  })
  debug('response', JSON.stringify(response, null, 2))
  return response
}

module.exports.create = async (body) => {
  debug('store ', JSON.stringify(body, null, 2))
  elasticsearch.create({
    index: auditLogConfig.elasticSearchIndex,
    type: '_doc',
    id: (await uid.generateKsuid()).canonical,
    body
  })
}

module.exports.getAudits = async ({
  orderBy = 'timestamp', // order field
  order = 'desc', // order direction

  search, // generic search word, see fields below

  dateRange, // dates range

  withAudit, // include audit action entityName flag
  noUser, // noUser flag

  page = 1,
  perPage = 30
}) => {
  page = page ? parseInt(page) : page
  perPage = perPage ? parseInt(perPage) : perPage

  const options = {
    from: (page - 1) * perPage,
    size: perPage,
    query: {
      bool: {
        must: [],
        should: [],
        must_not: []
      }
    }
  }

  if (withAudit) {
    options.query.bool.must
      .push({
        match: {
          'event.entityName': 'audit'
        }
      })
  } else {
    options.query.bool.must_not
      .push({
        match: {
          'event.entityName': 'audit'
        }
      })
  }

  if (noUser) {
    options.query.bool.must_not
      .push({
        exists: {
          field: 'event.user'
        }
      })
  }

  if (Array.isArray(dateRange)) {
    options.query.bool.must
      .push({
        range: {
          timestamp: {
            gte: dateRange[0],
            lte: dateRange[1]
          }
        }
      })
  }

  if (search) {
    const searchableFields = [
      'event.user.username',
      'event.type',
      'event.entityName',
      'event.status',
      'transport.httpStatusCode'
    ]
    for (const field of searchableFields) {
      options.query.bool.should.push({
        match: {
          [field]: `${search}`
        }
      })

      options.query.bool.should.push({
        wildcard: {
          [field]: `${search}*`
        }
      })

      /*
      options.query.bool.should.push({
        wildcard: {
          [field]: {
            value: `${search}*`
          }
        }
      })
      */
    }
  }

  if (orderBy !== 'timestamp') {
    orderBy = `${orderBy}.keyword`
  }
  options.sort = {
    [orderBy]: order
  }

  if (!options.query.bool.must.length) {
    delete options.query.bool.must
  }

  if (!options.query.bool.should.length) {
    delete options.query.bool.should
  }

  if (!options.query.bool.must_not.length) {
    delete options.query.bool.must_not
  }

  debug('get audits', JSON.stringify(options, null, 2))

  return exports.search(options)
}

module.exports.getAuditById = async (auditId = '') => {
  const options = {
    query: {
      bool: {
        must: [{
          match: { _id: auditId }
        }]
      }
    }
  }

  debug('get audit by id', JSON.stringify(options, null, 2))

  return exports.search(options)
}
