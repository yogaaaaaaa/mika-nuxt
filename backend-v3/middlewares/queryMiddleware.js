'use strict'

const moment = require('moment')
const Op = require('sequelize').Op

/**
 * Generate sequelize query setting for pagination in `req.sequelizePagination`
 */
module.exports.paginationToSequelize = (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  req.query.order = ['asc', 'desc'].includes(req.query.order) ? req.query.order : 'desc'
  req.query.order_by = req.query.order_by || 'createdAt'

  req.paginationSequelize = {
    offset: (req.query.page - 1) * req.query.per_page,
    limit: req.query.per_page,
    order: [
      [req.query.order_by, req.query.order]
    ]
  }
  req.applyPaginationSequelize = (query) => {
    if (typeof query !== 'object') return
    Object.assign(query, req.paginationSequelize)
  }
  next()
}

/**
 * Generate sequelize query setting for simple filter,
 * via array in query string (`req.query.filters`)
 *
 * Each element of `filters` is consist of 3 parts
 * (field),(operator),(value)
 *
 * For `transactionStatus` equal to `success` its translate
 * to `filters[]=transactionStatus,eq,success`.
 *
 * Another example of query string :
 ```
  filters[]=transactionStatus,eq,success&filters[]=createdAt,lastday,1
 ```
 *
 */
module.exports.filtersToSequelize = (req, res, next) => {
  req.filtersWhereSequelize = {}

  req.applyFiltersWhereSequelize = (query) => {
    if (typeof query !== 'object') return
    if (!query.where) query.where = {}
    Object.assign(query.where, req.filtersWhereSequelize)
  }

  if (Array.isArray(req.query.filters)) {
    let andFilters = []
    for (const filter of req.query.filters) {
      let filterSplit = filter.split(',')
      if (filterSplit.length >= 2) {
        let field = filterSplit[0]
        let op = filterSplit[1]

        let value = ''

        if (filterSplit.length > 2) {
          value = filterSplit.slice(2, filterSplit.length).join(',')
        }

        switch (op) {
          case 'eq':
            andFilters.push({
              [field]: value
            })
            break
          case 'ne':
            andFilters.push({
              [field]: { [Op.ne]: value }
            })
            break
          case 'gt':
            andFilters.push({
              [field]: { [Op.gt]: value }
            })
            break
          case 'gte':
            andFilters.push({
              [field]: { [Op.gte]: value }
            })
            break
          case 'lt':
            andFilters.push({
              [field]: { [Op.lt]: value }
            })
            break
          case 'lte':
            andFilters.push({
              [field]: { [Op.lte]: value }
            })
            break
          case 'like':
            andFilters.push({
              [field]: { [Op.like]: value }
            })
            break
          case 'lasthour':
            value = parseInt(value) || 0
            andFilters.push({
              [field]: {
                [Op.gte]: moment().utc().subtract(value, 'hour').startOf('hour').toDate(),
                [Op.lte]: moment().utc().toDate()
              }
            })
            break
          case 'lastday':
            value = parseInt(value) || 0
            andFilters.push({
              [field]: {
                [Op.gte]: moment().utc().subtract(value, 'day').startOf('day').toDate(),
                [Op.lte]: moment().utc().toDate()
              }
            })
            break
          case 'lastweek':
            value = parseInt(value) || 0
            andFilters.push({
              [field]: {
                [Op.gte]: moment().utc().subtract(value, 'week').startOf('week').toDate(),
                [Op.lte]: moment().utc().toDate()
              }
            })
            break
          case 'lastmonth':
            value = parseInt(value) || 0
            andFilters.push({
              [field]: {
                [Op.gte]: moment().utc().subtract(value, 'month').startOf('month').toDate(),
                [Op.lte]: moment().utc().toDate()
              }
            })
            break
        }
      }
    }
    if (andFilters.length) {
      req.filtersWhereSequelize = {
        [Op.and]: andFilters
      }
    }
  }
  next()
}
