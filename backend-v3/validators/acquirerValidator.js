'use strict'

const { body } = require('express-validator')

const helper = require('./helper')

const directSettlementValidator = () => body('directSettlement').isBoolean()
const minimumAmountValidator = () => body('minimumAmount').isFloat({ min: 0 })
const maximumAmountValidator = () => body('maximumAmount').isFloat({ min: 0 })
const processFeeValidator = () => body('processFee').isFloat({ min: 0 })
const shareAcquirerValidator = () => body('shareAcquirer').isFloat({ min: 0, max: 1.0 })
const shareMerchantValidator = () => body('shareMerchant').isFloat({ min: 0, max: 1.0 })
const shareMerchantWithPartnerValidator = () => body('shareMerchantWithPartner').isFloat({ min: 0, max: 1.0 })
const sharePartnerValidator = () => body('sharePartner').isFloat({ min: 0, max: 1.0 })

const acquirerCompanyIdValidator = () => body('acquirerCompanyId').isInt()
const merchantIdValidator = () => body('merchantId').isInt()
const acquirerConfigIdValidator = () => body('acquirerConfigId').isInt()
const acquirerTypeIdValidator = () => body('acquirerTypeId').isInt()

const defaultValidator = [
  helper.archivedAtValidator,
  directSettlementValidator().optional({ nullable: true }),
  minimumAmountValidator().optional({ nullable: true }),
  maximumAmountValidator().optional({ nullable: true }),
  processFeeValidator().optional({ nullable: true }),
  shareAcquirerValidator().optional({ nullable: true }),
  shareMerchantValidator().optional({ nullable: true }),
  shareMerchantWithPartnerValidator().optional({ nullable: true }),
  sharePartnerValidator().optional({ nullable: true }),
  acquirerCompanyIdValidator().optional({ nullable: true })
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
