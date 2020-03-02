'use strict'

const batchNumberCounter = Math.round(Math.random() * 999000)

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert('acquirerTerminalCommon', [
        {
          id: 1,
          name: 'Common Config for Terminal BNI',
          config: JSON.stringify({
            tleKekSam: {
              type: 'terminalBni',
              serial: 'kekSamMika1',
              aid: 'A0000000184B656B53616D0000010102',
              pin: '12345678',
              publicKey: 'A4EC1CBC0AFA5D92574F0BA4CAFD46E31845379CAB188BBCAD5DC1EB7F9F846FFED8114990D54B915F2DF63B673FD999CD8270D47CCA919D55C0E9620C610BAC06F8230498990DE2B25020F113544EDDF85BA93B257C5AD2CD77DF852CD57B6909906454443BD62E37E69D8FD6964D13F578F6CE199710378C1EFBF3109E36C9',
              publicKeyExponent: '010001'
            }
          }),
          acquirerCompanyId: 3
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('acquirerTerminal', [
        {
          id: 1,
          mid: '000100012001946',
          tid: '12194620',
          acquirerTerminalCommonId: 1,
          type: 'terminalBni',
          config: JSON.stringify({
            tle: {
              nii: 80,
              acquirerID: '001',
              vendorID: '00000001',
              ltmkID: '0011',
              ltmk: '6E0E76299D6BB507F73116C2DF454054',
              ltwkID: '0020',
              ltwkDek: '262679FB20F1AB7301B0496DA4F83DAD',
              ltwkMak: '7CE9B6578A8558F846F4E004D5EFA4EC',
              ltmkDownloadAt: new Date(),
              ltwkDownloadAt: new Date()
            },
            terminalKey: {
              masterKey: 'AACD1C4FD79645A0',
              workingKey: '6D00349445085BDB',
              pinKey: '5BFD516DA292FBE0'
            },
            terminalKeyCredit: {}
          })
        },
        {
          id: 2,
          mid: '000100012001946',
          tid: '12194621',
          acquirerTerminalCommonId: 1,
          type: 'terminalBni',
          config: JSON.stringify({
            tle: {
              nii: 80,
              acquirerID: '001',
              vendorID: '00000001',
              ltmkID: null,
              ltmk: null,
              ltwkID: null,
              ltwkDek: null,
              ltwkMak: null,
              ltmkDownloadAt: null,
              ltwkDownloadAt: null
            },
            terminalKey: {
              masterKey: 'AACD1C4FD79645A0',
              workingKey: '6D00349445085BDB',
              pinKey: '5BFD516DA292FBE0'
            },
            terminalKeyCredit: {}
          })
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('acquirerConfig', [
        // bank bni
        {
          id: 2001,
          name: 'BNI Debit',
          handler: 'cardBniDebit',
          config: JSON.stringify({
            nii: '82' // debit tle
          })
        },
        {
          id: 2002,
          name: 'BNI Credit',
          handler: 'cardBniCredit',
          config: JSON.stringify({
            nii: '80' // credit tle
          })
        },

        // Switcher
        {
          id: 2003,
          name: 'Card Switcher Maju Tembak',
          handler: 'cardSwitcher',
          config: JSON.stringify({
            rules: [
              {
                name: 'Debit on BNI',
                cardIssuerIds: [
                  'bankBni'
                ],
                cardTypeIds: [
                  'debit'
                ],
                acquirerId: 2001
              },
              {
                name: 'Debit off us via BNI',
                cardTypeIds: [
                  'debit'
                ],
                acquirerId: 2002
              },
              {
                name: 'Credit on BNI',
                cardIssuerIds: [
                  'bankBni'
                ],
                cardTypeIds: [
                  'credit'
                ],
                acquirerId: 2003
              },
              {
                name: 'Credit off us via BNI',
                cardTypeIds: [
                  'credit',
                  'many'
                ],
                acquirerId: 2004
              },

              {
                name: 'Debit off us via Kuma Bank',
                cardTypeIds: [
                  'debit'
                ],
                acquirerId: 2100
              },
              {
                name: 'Credit off us via Kuma Bank',
                cardTypeIds: [
                  'credit',
                  'many'
                ],
                acquirerId: 2101
              }
            ]
          }),
          merchantId: 1
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('acquirerConfigAgent', [
        // Acquirer config bni for agent 2
        {
          id: 2001,
          agentId: 2,
          acquirerConfigId: 2001,
          acquirerTerminalId: 1,
          batchNumberCounter
        },
        {
          id: 2002,
          agentId: 2,
          acquirerConfigId: 2002,
          acquirerTerminalId: 1,
          batchNumberCounter
        },

        // Acquirer config bni for agent 3
        {
          id: 2003,
          agentId: 3,
          acquirerConfigId: 2001,
          acquirerTerminalId: 2,
          batchNumberCounter
        },
        {
          id: 2004,
          agentId: 3,
          acquirerConfigId: 2002,
          acquirerTerminalId: 2,
          batchNumberCounter
        }
      ], { transaction: t })

      await queryInterface.bulkInsert('acquirer', [
        {
          id: 2001,
          name: 'Kartu Debit BNI Maju Tembak On us | Debit on us',
          gateway: false,
          hidden: true,
          minimumAmount: 1,
          shareAcquirer: 0.02,
          shareMerchant: 0.9800,
          acquirerTypeId: 5,
          acquirerConfigId: 2001,
          merchantId: 1
        },
        {
          id: 2002,
          name: 'Kartu Debit BNI Maju Tembak Off us | Debit off us',
          gateway: false,
          hidden: true,
          minimumAmount: 1,
          shareAcquirer: 0.05,
          shareMerchant: 0.9500,
          acquirerTypeId: 5,
          acquirerConfigId: 2001,
          merchantId: 1
        },

        {
          id: 2003,
          name: 'Kartu Kredit BNI Maju Tembak On us | Credit on us',
          gateway: false,
          hidden: true,
          minimumAmount: 1,
          shareAcquirer: 0.05,
          shareMerchant: 0.9500,
          acquirerTypeId: 6,
          acquirerConfigId: 2002,
          merchantId: 1
        },
        {
          id: 2004,
          name: 'Kartu Kredit BNI Maju Tembak Off us | Credit off us',
          gateway: false,
          hidden: true,
          minimumAmount: 1,
          shareAcquirer: 0.07,
          shareMerchant: 0.9300,
          acquirerTypeId: 6,
          acquirerConfigId: 2002,
          merchantId: 1
        },

        {
          id: 2100,
          name: 'Kartu Debit Kuma Bank Maju tembak Off us | Debit off us',
          gateway: false,
          hidden: true,
          shareAcquirer: 0.02,
          shareMerchant: 0.9800,
          minimumAmount: 1,
          processFee: 0,
          acquirerTypeId: 5,
          acquirerConfigId: 101,
          merchantId: 1
        },
        {
          id: 2101,
          name: 'Kartu Kredit Kuma Bank Maju Tembak Off us | Kredit Off us',
          gateway: false,
          hidden: true,
          shareAcquirer: 0.02,
          shareMerchant: 0.9800,
          processFee: 0,
          minimumAmount: 1,
          acquirerTypeId: 6,
          acquirerConfigId: 101,
          merchantId: 1
        },

        {
          id: 2200,
          name: 'Pembayaran Kartu Maju Tembak',
          gateway: true,
          hidden: false,
          minimumAmount: 1,
          acquirerTypeId: 50,
          acquirerConfigId: 2003,
          merchantId: 1
        }

      ], { transaction: t })
    })
  },
  down: (queryInterface, Sequelize) => {
  }
}
