#!/usr/bin/env node
'use strict'

const commander = require('commander')
const bcrypt = require('bcryptjs')

commander.version('0.1.0')

commander
  .command('gen <value> [values...]')
  .description('Generate bcrypt hashes')
  .option('-s, --salt <round>', ' Salt round', 10)
  .action((value, values, option) => {
    console.log(value)
    console.log(bcrypt.hashSync(value, bcrypt.genSaltSync(option.salt)))
    console.log()

    if (values.length) {
      for (const val of values) {
        console.log(val)
        console.log(bcrypt.hashSync(val, bcrypt.genSaltSync(option.salt)))
        console.log()
      }
    }
  })

commander
  .command('comp <value> <hashValue>')
  .description('Compare bcrypt hash with raw value')
  .action((value, hashValue, option) => {
    console.log(bcrypt.compareSync(value, hashValue))
  })

commander.parse(process.argv)
