#!/usr/bin/env node
'use strict'

const commander = require('commander')
const crypto = require('crypto')

commander.version('0.1.0')

commander
  .command('cb1')
  .description('Generate key cb1')
  .action((value, option) => {
    const id = crypto.randomBytes(16).toString('hex')
    const cbkey = {
      id,
      cbk: 'cb1',
      k: crypto.randomBytes(64).toString('base64')
    }

    console.log(cbkey)
    console.log()
    console.log('JSON formatted')
    console.log(JSON.stringify(cbkey))
  })

commander
  .command('cb2')
  .description('Generate cb2 key, consist of client key and server key')
  .action(() => {
    const id = crypto.randomBytes(16).toString('hex')
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    const cbkeyClient = {
      id,
      cbk: 'cb2',
      kt: 'private',
      k: keyPair.privateKey
    }

    const cbkeyServer = {
      id,
      cbk: 'cb2',
      kt: 'public',
      k: keyPair.publicKey
    }

    console.log()
    console.log('## Client Key')
    console.log(cbkeyClient)
    console.log('## Client Key (JSON)')
    console.log(JSON.stringify(cbkeyClient))
    console.log()

    console.log()
    console.log('## Server Key')
    console.log(cbkeyServer)
    console.log('## Server Key (JSON)')
    console.log(JSON.stringify(cbkeyServer))
    console.log()
  })

commander.parse(process.argv)
