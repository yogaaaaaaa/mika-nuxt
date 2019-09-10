'use strict'

const uid = require('../../../libs/uid')
const tcashQrn = require('../../../libs/aqTcashQrn')

async function begin () {
  const genTransactionId = await uid.generateTransactionId()

  const config = {
    // tcashQrnMerchantId: '190717011228001',
    tcashQrnMerchantId: '190717011155001',

    amount: 100,
    city: 'Jakarta',
    postalCode: '12190',
    merchantName: 'Mika',
    merchantTrxID: genTransactionId.id
  }

  const response = await tcashQrn.generateTcashNationalQr(tcashQrn.mixConfig(config))
  console.log(JSON.stringify(response, null, 2))
}

begin()
