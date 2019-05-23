#!/usr/bin/env node
'use strict'

const commander = require('commander')
const crypto = require('crypto')

commander.version('0.1.0')

commander
  .command('cb1')
  .description('Generate cb1 key, consist of client key and server key')
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

    let cbkeyClient = {
      id,
      cbx: 'cb1',
      keyType: 'private',
      key: keyPair.privateKey
    }

    let cbkeyServer = {
      id,
      cbx: 'cb1',
      keyType: 'public',
      key: keyPair.publicKey
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

commander
  .command('cb3')
  .description('Generate key cb3')
  .action((value, option) => {
    const id = crypto.randomBytes(16).toString('hex')
    let cbkey = {
      id,
      cbx: 'cb3',
      key: crypto.randomBytes(64).toString('base64')
    }

    console.log(cbkey)
    console.log()
    console.log('JSON formatted')
    console.log(JSON.stringify(cbkey))
  })

commander.parse(process.argv)
