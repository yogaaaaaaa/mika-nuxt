'use strict'

const express = require('../libs/express')
const dirConfig = require('../configs/dirConfig')
const router = express.Router()

const commonConfig = require('../configs/commonConfig')

router.use(`${commonConfig.thumbnailsEndpoint}`, express.static(dirConfig.thumbnailsDir))
router.use(`${commonConfig.thumbnailsEndpoint}/customs`, express.static(dirConfig.customThumbnailsDir))

module.exports = router
