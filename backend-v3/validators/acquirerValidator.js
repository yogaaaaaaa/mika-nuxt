'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const minimumAmountValidator = () => body('minimumAmount').isNumeric()
const maximumAmountValidator = () => body('maximumAmount').isNumeric()
const processFeeValidator = () => body('processFee').isNumeric()
const shareAcquirerValidator = () => body('shareAcquirer').isNumeric()
const shareMerchantValidator = () => body('shareMerchant').isNumeric()
const shareMerchantWithPartnerValidator = () => body('shareMerchantWithPartner').isNumeric()
const sharePartnerValidator = () => body('sharePartner').isNumeric()

const merchantIdValidator = () => body('merchantId').not().isEmpty()
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
  acquirerTypeIdValidator()
]

module.exports.bodyUpdate = [
  defaultValidator,
  merchantIdValidator().optional(),
  acquirerTypeIdValidator().optional()
]
