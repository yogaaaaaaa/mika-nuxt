'use strict'

const nodemailer = require('nodemailer')

const defaultTransport = nodemailer.createTransport(require('../configs/mailerConfig'))

module.exports = defaultTransport
