'use strict'

/**
 * Wrap express with mandatory library, like async-errors
 */

const express = require('express')
require('express-async-errors')

module.exports = express
