'use strict'

/**
 * Warning ! This test block event loop
 */

const uid = require('../../libs/uid')

let idGenerated = 0
let idGeneratedCollision = 0

let idObject = new Map()

let startTime = Date.now()
let currentTime = 0
let lastCurrentTime = startTime

console.log(`Generate idAlias - long version - eg ${uid.generateTransactionIdLongAlias('mika').idAlias}`)

function display () {
  console.log()
  console.log('runningTime', (currentTime - startTime) / 1000)
  console.log('idGenerated', idGenerated)
  console.log('idGeneratedCollision', idGeneratedCollision)
  console.log('idGeneratedPerSecond', idGenerated / ((currentTime - startTime) / 1000))
  console.log()
}

while (true) {
  let currentIdObject = uid.generateTransactionIdLongAlias('mika')
  if (idObject.get(currentIdObject.idAlias)) idGeneratedCollision++
  idObject.set(currentIdObject.idAlias, currentIdObject.idAlias)
  idGenerated++
  currentTime = Date.now()
  if ((currentTime - lastCurrentTime) > 2000) {
    display()
    lastCurrentTime = currentTime
  }
}
