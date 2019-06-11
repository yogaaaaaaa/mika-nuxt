'use strict'

module.exports = async (req, res) => {
  let param = {
    delayMs: 300
  }

  if (req.body) {
    param.delayMs = parseInt(req.body.delayMs) || param.delayMs
  }

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      res.status(200).send(`delay ${param.delayMs} ms is finished`)
      resolve()
    }, param.delayMs)
  })
}
