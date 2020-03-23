'use strict'

const debug = require('debug')('mika:fraudDetectionApi')

const jwt = require('jsonwebtoken')
const superagent = require('superagent')
const models = require('models')
const error = require('./error')
const redis = require('libs/redis')
const moment = require('moment')
const { Op } = models.Sequelize

const fraudDetectionApiConfig = require('configs/fraudDetectionApiConfig')

class FraudDetectionApi {
  constructor (config, redis) {
    this._config = config

    this._redis = redis
    this._cacheKeyPrefix = 'FraudDetection_Rules_'
    this._cacheExpiry = 60 * 10 // 10 minutes
  }

  _getCacheKey (cachePattern) {
    return `${this._cacheKeyPrefix}${cachePattern}`
  }

  async _getCache (cachePattern) {
    const redisKey = this._getCacheKey(cachePattern)
    const cache = await this._redis.get(redisKey)
    if (cache) {
      debug('cache hit', redisKey)
      return JSON.parse(cache)
    } else {
      debug('cache miss', redisKey)
    }
  }

  async _setCache (cachePattern, data) {
    const redisKey = this._getCacheKey(cachePattern)
    debug('cache set', redisKey)
    return this._redis.set(
      redisKey,
      JSON.stringify(data),
      'EX', this._cacheExpiry
    )
  }

  async _clearCache () {
    await this._redis.deletePattern(`${this._cacheKeyPrefix}*`)
  }

  async getMerchantRule (id) {
    // Get from cache if available
    const cache = await this._getCache(`merchant_rule_id_${id}`)
    if (cache) return cache

    const url = this._config.url + '/rules/' + id
    const rule = await this._request('GET', url)

    const merchant = await models.merchant.findByPk(id)
    if (merchant) {
      rule.data.merchant = merchant.name
    }

    // Save to cache
    await this._setCache(id, rule)

    return rule
  }

  async getMerchantRules (query) {
    // get data from fraud detection api
    let queries = '?'
    let cachePattern = 'merchant_rules_'
    Object.keys(query).forEach(q => {
      queries += `${q}=${query[q]}&`
      cachePattern += `${query[q]}_`
    })

    // Get from cache if available
    const cache = await this._getCache(cachePattern)
    if (cache) return cache

    const url = this._config.url + '/rules' + queries
    const resp = await this._request('GET', url)

    // fill in the merchant names
    const merchantIds = resp.data.map(r => r.id_merchant)
    const merchants = await models.merchant.findAll({
      attributes: ['name'],
      where: {
        id: {
          [Op.in]: merchantIds
        }
      }
    })
    merchants.forEach((m, index) => {
      resp.data[index].merchant = m.name
    })

    // Save to cache
    await this._setCache(cachePattern, resp)

    return resp
  }

  async createMerchantRule (data) {
    debug('data.id_merchant', data.id_merchant)
    const merchant = await models.merchant.findByPk(parseInt(data.id_merchant))
    if (!merchant) {
      throw error.createError({
        name: error.genericErrorTypes.INVALID_REFERENCES,
        data: ['id_merchant']
      })
    }
    const url = this._config.url + '/rules'
    const response = await this._request('POST', url, data)
    response.data.merchant = merchant ? merchant.name : null

    // Clear cache
    await this._clearCache()

    return response
  }

  async updateMerchantRule (data, id) {
    const merchant = await models.merchant.findByPk(id)

    const url = this._config.url + '/rules/' + id
    const resp = await this._request('PUT', url, data)
    resp.data.merchant = merchant ? merchant.name : null

    // Clear cache
    await this._clearCache()

    return resp
  }

  async destroyMerchantRule (id) {
    const url = this._config.url + '/rules/' + id
    const response = await this._request('DELETE', url)

    // Clear cache
    await this._clearCache()

    return response
  }

  _generateToken () {
    return jwt.sign({ key: this._config.key }, this._config.secret)
  }

  async _request (method, url, body) {
    debug('request', method, url, JSON.stringify(body, null, 2))
    try {
      const token = await this._generateToken()
      const timestamp = moment().unix()
      const key = this._config.key
      const agentPromise = superagent(method, url)
        .set('x-access-token', token)
        .set('x-access-trequest', timestamp)
        .set('key', key)
        .set('Accept', 'application/json')

      if (body) agentPromise.send(body)
      const resp = await agentPromise
      debug('response',
        resp.status,
        JSON.stringify(resp.body, null, 2)
      )
      return resp.body
    } catch (err) {
      if (err.response) {
        debug('response error',
          err.response.status,
          JSON.stringify(err.response.body, null, 2)
        )
      }
      throw err
    }
  }
}

const fraudDetectionApi = new FraudDetectionApi(fraudDetectionApiConfig, redis)

module.exports = fraudDetectionApi
