#!/usr/bin/env node
'use strict'

const parameter = require('commander')
const mqtt = require('mqtt')

parameter
  .version('0.1.0')
  .option('--url [type]', 'MQTT url to test', process.env.MQTT_URL || 'wss://broker.mikaapp.id')
  .option('--username [type]', 'MQTT User name', process.env.MQTT_USERNAME || 'superuser')
  .option('--password [type]', 'MQTT Password', process.env.MQTT_PASSWORD || 'superuser')
  .option('--topic [type]', 'Topic to test', 'test')
  .option('--timeout [type]', 'Test timeout in seconds', 15)
  .parse(process.argv)

function begin () {
  const testMessage = 'This is a test message'

  setTimeout(() => {
    console.log('MQTT Test timeout')
    process.exit(4)
  }, parameter.timeout * 1000)

  console.log()
  console.log('Begin MQTT check with parameter')
  console.log('url:', parameter.url)
  console.log('username:', parameter.username)
  console.log('password:', parameter.password)
  console.log('topic:', parameter.topic)
  console.log()

  const mqttClient = mqtt.connect(parameter.url, {
    username: parameter.username,
    password: parameter.password
  })

  mqttClient.on('message', (topic, message) => {
    if (topic === parameter.topic && message.toString('utf8') === testMessage) {
      console.log('MQTT Message Received Correctly')
      process.exit(0)
    }
  })

  mqttClient.on('connect', () => {
    console.log('MQTT Connected')
    mqttClient.subscribe(parameter.topic, () => {
      console.log('MQTT Subscribed')
      mqttClient.publish(parameter.topic, testMessage, () => {
        console.log('MQTT Published')
      })
    })
  })

  mqttClient.on('error', (err) => {
    console.log(err.name, ':', err.message)
    process.exit(1)
  })
}

begin()
