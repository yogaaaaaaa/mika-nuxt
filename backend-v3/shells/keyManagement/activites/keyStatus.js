'use strict'

const keyManager = require('libs/keyManager')

module.exports = async (ctx) => {
  ctx.term.bold('Data Encryption Key (DEK) Status\n\n')
  let encKeyBox
  let keyBox
  try {
    encKeyBox = await keyManager.loadKeyFile()
    keyBox = await keyManager.getKey()
  } catch (err) {}

  ctx.term.bold('=== Encrypted DEK ===\n')
  if (encKeyBox) {
    ctx.term.bold('Key Id    : '); ctx.term(encKeyBox.id); ctx.term('\n')
    ctx.term.bold('Created   : '); ctx.term(encKeyBox.createdAt); ctx.term('\n')
  } else {
    ctx.term.bold.red('No active encrypted DEK !\n')
  }

  ctx.term('\n')

  ctx.term.bold('=== Loaded/activated DEK === \n')
  if (keyBox) {
    ctx.term.bold('Key Id    : '); ctx.term(keyBox.id); ctx.term('\n')
  } else {
    ctx.term.bold.red('DEK is not loaded !\n')
  }
  await ctx.term.waitForAnyKey()
}
