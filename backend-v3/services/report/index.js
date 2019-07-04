'use strict'

// const { ValidationError } = require('moleculer').Errors
const generate = require('./generate')
const uid = require('../../libs/uid')

const eventTypes = {
  REPORT_DONE: 'report.merchantStaffDailyReportDone',
  REPORT_ERROR: 'report.merchantStaffDailyReportError'
}

module.exports = {
  name: 'report',
  metadata: {},
  settings: {},
  events: {
  },
  actions: {
    hello (ctx) {
      return {
        msg: 'Hello World !'
      }
    },
    createMerchantStaffDailyReport: {
      params: {
        merchantStaffId: { type: 'string', min: 1 },
        options: {
          type: 'object',
          optional: true,
          props: {
            date: { type: 'date', optional: true },
            email: { type: 'email', optional: true },
            locale: { type: 'string', optional: true },
            utcOffset: { type: 'string', optional: true }
          }
        }
      },
      async handler (ctx) {
        let idReport = await uid.ksuid.random()

        generate.createMerchantStaffDailyReport(ctx.params.merchantStaffId, ctx.params.options)
          .catch(err => this.broker.emit(eventTypes.REPORT_ERROR, err))
          .then(result => this.broker.emit(eventTypes.REPORT_DONE, result))

        return {
          idReport: idReport.string
        }
      }
    }
  },
  created () {
  },
  async started () {
  },
  async stopped () {
  }
}
