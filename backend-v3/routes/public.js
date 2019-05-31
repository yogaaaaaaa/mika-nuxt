'use strict'

const express = require('../libs/express')
const dirConfig = require('../configs/dirConfig')
const router = express.Router()

router.use('/thumbnails', express.static(dirConfig.thumbnailDir))
router.use('/thumbnails/customs', express.static(dirConfig.customThumbnailDir))

module.exports = router
