'use strict'

const cipherbox = require('libs/cipherbox')
const crypto = require('crypto')

async function scrypt (password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, key) => {
      if (err) reject(err)
      resolve(key)
    })
  })
}

module.exports.create = async (passwords, keyBox) => {
  if (!Array.isArray(passwords)) return
  if (passwords.length < 2) return

  const result = {
    id: keyBox.id,
    createdAt: (new Date()).toISOString(),
    encKeyBoxes: []
  }

  for (let i = 0; i < passwords.length - 1; i++) {
    for (let j = i + 1; j < passwords.length; j++) {
      const salt = crypto.randomBytes(32)
      const key = await scrypt(passwords[i] + passwords[j], salt)
      const { box } = cipherbox.createCb0({
        data: JSON.stringify(keyBox),
        key
      })

      result.encKeyBoxes.push({
        salt: salt.toString('base64'),
        box
      })
    }
  }

  return result
}

module.exports.open = async (twoManKeyBox, passwords) => {
  if (!Array.isArray(passwords)) return
  if (passwords.length < 2) return

  passwords = [
    passwords[0] + passwords[1],
    passwords[1] + passwords[0]
  ]
  for (const password of passwords) {
    for (const encKeyBox of twoManKeyBox.encKeyBoxes) {
      const openResult = cipherbox.openCb0({
        box: encKeyBox.box,
        key: await scrypt(password, Buffer.from(encKeyBox.salt, 'base64')),
        tsTolerance: null
      })
      if (openResult) {
        return JSON.parse(openResult.data.toString())
      }
    }
  }
}
