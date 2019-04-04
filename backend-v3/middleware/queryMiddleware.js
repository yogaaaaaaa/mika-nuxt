'use strict'

/**
 * Generate sequelize setting for pagination
 */
module.exports.sequelizePagination = (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1
  req.query.per_page = parseInt(req.query.per_page) || 30

  req.query.order = req.query.order || 'DESC'
  req.query.order_prop = req.query.order_prop || 'createdAt'

  req.sequelizePagination = {
    offset: (req.query.page - 1) * req.query.per_page,
    limit: req.query.per_page,
    order: [
      [req.query.order_prop, req.query.order]
    ]
  }
  next()
}

/**
 * Generate sequelize setting for filter (using like)
 */
module.exports.sequelizeFilterLike = (req, res, next) => {

}
