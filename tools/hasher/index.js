'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const os = require('os')

const hostname = os.hostname()

const port = 23000
const app = express()
app.disable('x-powered-by')
app.set('etag', false)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next) => {
  res.set('x-hostname', hostname)
  next()
})

app.post('/generate/hash', require('./handlers/genHash'))
app.post('/generate/delay', require('./handlers/genDelay'))
app.post('/generate/bcrypt', require('./handlers/genBcrypt'))

app.listen(port, () => console.log(`hasher is listening to ${port}`))
