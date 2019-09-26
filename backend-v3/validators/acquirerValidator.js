'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const minimumAmountValidator = () => body('minimumAmount').isFloat({ min: 0 })
const maximumAmountValidator = () => body('maximumAmount').isFloat({ min: 0 })
const processFeeValidator = () => body('processFee').isFloat({ min: 0 })
const shareAcquirerValidator = () => body('shareAcquirer').isFloat({ min: 0, max: 1.0 })
const shareMerchantValidator = () => body('shareMerchant').isFloat({ min: 0, max: 1.0 })
const shareMerchantWithPartnerValidator = () => body('shareMerchantWithPartner').isFloat({ min: 0, max: 1.0 })
const sharePartnerValidator = () => body('sharePartner').isFloat({ min: 0, max: 1.0 })

const merchantIdValidator = () => body('merchantId').not().isEmpty()
const acquirerConfigIdValidator = () => body('acquirerConfigId').not().isEmpty()
const acquirerTypeIdValidator = () => body('acquirerTypeId').not().isEmpty()

const defaultValidator = [
  helper.archivedAtValidator,
  minimumAmountValidator().optional({ nullable: true }),
  maximumAmountValidator().optional({ nullable: true }),
  processFeeValidator().optional({ nullable: true }),
  shareAcquirerValidator().optional({ nullable: true }),
  shareMerchantValidator().optional({ nullable: true }),
  shareMerchantWithPartnerValidator().optional({ nullable: true }),
  sharePartnerValidator().optional({ nullable: true })
]

module.exports.bodyCreate = [
  defaultValidator,
  merchantIdValidator(),
  acquirerTypeIdValidator(),
  acquirerConfigIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  merchantIdValidator().optional(),
  acquirerTypeIdValidator().optional(),
  acquirerConfigIdValidator().optional()
]
