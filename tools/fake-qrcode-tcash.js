#!/usr/bin/env node
'use strict'

/**
 * MIKA qrcode style, fake TCASH inquiry/pay sender
 */

const parameter = require('commander')
const request = require('request-promise')

/**
 * Generate date format for use in tcash, e.g : 20180928132659
 */
function tcashDateNow () {
  let now = new Date()
  return '' +
    now.getFullYear() +
    ((now.getMonth()).toString()).padStart(2, '0') +
    ((now.getDate()).toString()).padStart(2, '0') +
    ((now.getHours()).toString()).padStart(2, '0') +
    ((now.getMinutes()).toString()).padStart(2, '0') +
    ((now.getSeconds()).toString()).padStart(2, '0')
}

/**
 * Generate TCASH style trx_id
 */
function randomTcashTrxId () {
  const length = 10
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let retVal = ''
  for (let i = 0; i < length; i++) {
    retVal += charSet.charAt(Math.floor(Math.random() * charSet.length))
  }
  return retVal
}

/**
 * Sleep ! now with promise
 */
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

parameter
  .version('0.1.0')
  .description('Emulate tcash payment, by doing call directly to specified mika-api endpoint')
  .option('--inqurl <url>', 'Inquiry URL, read from environment FAKE_TCASH_INQUIRYURL if exist', process.env.FAKE_TCASH_INQUIRYURL || 'http://localhost:12000/payment/tcash/inquiry')
  .option('--payurl <url>', 'Pay URL environment FAKE_TCASH_PAYURL if exist', process.env.FAKE_TCASH_PAYURL || 'http://localhost:12000/payment/tcash/pay')
  .option('--terminal <name>', 'Terminal name', 'mika')
  .option('--pwd <password>', 'Terminal Password', 'MIKA')
  .option('--merchant <name>', 'Merchant full name', 'Mika')
  .option('--msisdn <number>', 'Costumer msisdn', '6281230064231')
  .option('--trxid <id>', 'Define your own trx_id, default is randomly generated')
  .option('--msg <text>', 'Customer SMS message')
  .option('--paydelay <seconds>', 'Delay in seconds in floating point, before pay is send', 5)
  .option('--qrcode <text>', 'Qrcode content, format: \'TWALLET|O|{{terminal}}|{{AccNo}}\', example: \'TWALLET|O|mika|0000011009\'')
  .option('--quiet', 'Don\'t display anything', true)
  .parse(process.argv)

async function begin () {
  if (parameter.qrcode) {
    let qrcodeArray = parameter.qrcode.split('|')
    let qrcode = {
      terminal: qrcodeArray[2],
      accNo: qrcodeArray[3]
    }

    if (!parameter.quiet) {
      console.log()
      console.log('#### Fake Tcash Started with parameter ####')
      console.log('Inquiry URL :', parameter.inqurl)
      console.log('Pay URL :', parameter.payurl)
      console.log('Terminal :', parameter.terminal)
      console.log('Password :', parameter.pwd)
      console.log('Merchant Full Name :', parameter.merchant)
      console.log('MSISDN :', parameter.msisdn)
      console.log()
      console.log('#### Qrcode ####')
      console.log('Qrcode :', parameter.qrcode)
      console.log('Qrcode Component :', JSON.stringify(qrcode))
      console.log()
    }

    /** @NOTE for some reason, tcash decide to upper case the terminal name, we just follow that */
    if (qrcode.terminal.toUpperCase() === parameter.terminal.toUpperCase()) {
      let form = {
        trx_type: '',
        trx_date: tcashDateNow(),
        acc_no: qrcode.accNo,
        msisdn: parameter.msisdn,
        merchant: parameter.merchant,
        pwd: parameter.pwd,
        terminal: parameter.terminal.toUpperCase() /** @NOTE same here regarding terminal name .. */
      }

      if (parameter.msg) form.msg = parameter.msg

      // Do inquiry() POST request
      try {
        form.trx_type = '021'
        if (!parameter.quiet) {
          console.log()
          console.log('do inquiry()')
          console.log('url encoded body:', JSON.stringify(form))
        }

        let response = await request({
          method: 'POST',
          uri: parameter.inqurl,
          form: form
        })

        if (!parameter.quiet) {
          console.log('inquiry() response:', response)
        }

        let tcashResponses = response.split(':')
        if (tcashResponses.length) {
          if (
            tcashResponses[0] === '00' &&
            tcashResponses[1] === parameter.merchant &&
            parseInt(tcashResponses[2]) >= 100
          ) {
            form.amount = parseInt(tcashResponses[2])
            form.bill_ref = parseInt(tcashResponses[3])
            if (parameter.trx_id) {
              form.trx_id = parameter.trx_id
            } else {
              form.trx_id = randomTcashTrxId()
            }
            if (!parameter.quiet) {
              console.log('inquiry() OK:', response)
            }
          } else {
            console.error('ERROR: inquiry() rejected because minimum value or malformed inquiry() response')
            process.exit(1)
          }
        } else {
          console.error('ERROR: malformed inquiry() response')
          process.exit(1)
        }
      } catch (error) {
        console.error('ERROR: general error while requesting inquiry()')
        if (!parameter.quiet) {
          console.log(error.message)
        }
        process.exit(1)
      }

      if (parameter.paydelay > 0) {
        if (!parameter.quiet) {
          console.log()
          console.log(`delaying ${parameter.paydelay} seconds before pay() is send`)
        }
        await sleep(parameter.paydelay * 1000)
      }

      try {
        form.trx_type = '022'
        if (!parameter.quiet) {
          console.log()
          console.log('do pay()')
          console.log('url encoded body:', JSON.stringify(form))
        }
        // Do pay() POST request
        form.trx_type = '022'
        let response = await request({
          method: 'POST',
          uri: parameter.payurl,
          form: form
        })

        if (!parameter.quiet) {
          console.log('pay() response:', response)
        }

        let tcashResponses = response.split(':')

        if (tcashResponses.length) {
          if (
            tcashResponses[0] === '00' &&
            tcashResponses[1] === form.trx_id
          ) {
            if (!parameter.quiet) {
              console.log('pay() OK, payment flow complete')
            }
            process.exit(0)
          } else {
            console.error('ERROR: pay() is rejected because of invalid trx_id or malformed response')
            process.exit(2)
          }
        } else {
          console.error('ERROR: malformed pay() response')
          process.exit(2)
        }
      } catch (error) {
        console.error('ERROR: general error while doing pay() request')
        if (!parameter.quiet) {
          console.log(error.message)
        }
        process.exit(2)
      }
    } else {
      console.error('ERROR: merchant user name defined is not same in QRCODE')
    }
  } else {
    console.error('ERROR: QRCODE is not present in parameter')
  }
}
begin()
