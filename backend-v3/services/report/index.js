'use strict'

/*
const { ValidationError } = require('moleculer').Errors
const generate = require('./generate')
const uid = require('../../libs/uid')

const eventTypes = {
  REPORT_DONE: 'report.merchantStaffDailyReportDone',
  REPORT_ERROR: 'report.merchantStaffDailyReportError'
}
*/

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
    }
    /* TODO: this service actions is not working in postgres
    createMerchantStaffDailyReport: {
      params: {
        merchantStaffId: { type: 'string', min: 1 },
        options: {
          type: 'object',
          optional: true,
          props: {
            date: { type: 'date', optional: true, convert: true },
            email: { type: 'email', optional: true },
            locale: { type: 'string', optional: true },
            utcOffset: { type: 'string', optional: true }
          }
        }
      },
      async handler (ctx) {
        const idReport = await uid.ksuid.random()

        generate.createMerchantStaffDailyReport(ctx.params.merchantStaffId, ctx.params.options)
          .catch(err => {
            this.broker.emit(eventTypes.REPORT_ERROR, err)
            console.error(err)
          })
          .then(result => {
            if (result) {
              this.broker.emit(eventTypes.REPORT_DONE, result)
            }
          })

        return {
          idReport: idReport.string
        }
      }
    }
    */
  },
  created () {
  },
  async started () {
  },
  async stopped () {
  }
}
