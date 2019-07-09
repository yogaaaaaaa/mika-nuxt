'use strict'

const uid = require('../../libs/uid')

function generateTransactionId () {
  let ksuid = uid.ksuid.randomSync()
  let ksuidBase32Crf = uid.base32CrfEncode(ksuid.raw)
  return {
    id: ksuid.string,
    idAlias: ksuidBase32Crf,
    idAliasFormatted: ksuidBase32Crf.match(/.{1,8}/g).join('-')
  }
}

let group = 3

setInterval(() => {
  console.log()
  let genCount = 10
  while (genCount) {
    let genId = generateTransactionId()
    console.log(genId.id, genId.idAlias, genId.idAliasFormatted)
    genCount--
  }
  group--
  if (!group) process.exit(0)
}, 3000)
