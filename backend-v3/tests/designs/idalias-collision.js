'use strict'

/**
 * Warning ! This test block event loop
 */

const uid = require('../../libs/uid')

function generateTransactionId (name) {
  let ksuid = uid.ksuid.randomSync()
  let part = uid.base32CrfEncode(ksuid.raw).substring(0, 12).match(/.{1,6}/g)
  return {
    id: ksuid.string,
    idAlias: `${name}-${part[0]}-${part[1]}`
  }
}

let idGenerated = 0
let idGeneratedCollision = 0

let idObject = new Map()

let startTime = Date.now()
let currentTime = 0
let lastCurrentTime = startTime

console.log(`Generate idAlias - eg ${generateTransactionId('mika').idAlias}`)

function display () {
  console.log()
  console.log('runningTime', (currentTime - startTime) / 1000)
  console.log('idGenerated', idGenerated)
  console.log('idGeneratedCollision', idGeneratedCollision)
  console.log('idGeneratedPerSecond', idGenerated / ((currentTime - startTime) / 1000))
  console.log()
}

while (true) {
  let currentIdObject = generateTransactionId('mika')
  if (idObject.get(currentIdObject.idAlias)) idGeneratedCollision++
  idObject.set(currentIdObject.idAlias, currentIdObject.idAlias)
  idGenerated++
  currentTime = Date.now()
  if ((currentTime - lastCurrentTime) > 2000) {
    display()
    lastCurrentTime = currentTime
  }
}
