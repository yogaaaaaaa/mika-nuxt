'use strict'

const childProcess = require('child_process')
const commander = require('commander')

const express = require('express')
require('express-async-errors')
const bodyParser = require('body-parser')

commander
  .version('1.0.0')
  .description('Listen to webhook name')
  .option('--config <path>', 'Config path', null)
  .parse(process.argv)

if (commander.config) console.log(`Using config file : ${commander.config}`)

const config = require(commander.config || './configs/gitlab-webhook-push-config')

const hookApp = express()
hookApp.use(bodyParser.json())

hookApp.post('/_dev_system/gitlab_webhook', async (req, res, next) => {
  if (req.headers['x-gitlab-token'] === config.gitlabToken) {
    if (req.body.event_name === 'push') {
      config.pushActions.forEach(async actions => {
        if (actions.homepage === req.body.repository.homepage) {
          console.log(`Receive Event Push - ${actions.homepage}`)
          console.log('exec', actions.exec)
          try {
            const execOptions = {}
            if (actions.cwd) execOptions.cwd = actions.cwd
            childProcess.exec(actions.exec, execOptions, (err, stdout) => {
              if (err) console.error(err)
              console.log(stdout)
            })
          } catch (err) {
            console.log(err)
          }
        }
      })
    }
    res.status(200).send('Webhook Accepted')
    return
  }
  res.status(400).send('Bad Webhook')
})

hookApp.listen(config.listenPort, (err) => {
  if (err) {
    console.err(err)
    process.exit(1)
  }
  console.log(`Gitlab webhook processor is listening on ${config.listenPort}`)
})
