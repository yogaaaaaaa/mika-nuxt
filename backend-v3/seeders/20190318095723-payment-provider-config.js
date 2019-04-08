'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('paymentProviderConfig', [
      {
        id: 1,
        name: 'Tcash/LinkAja default configuration',
        handler: 'tcash',
        providerIdReference: 'Mika',
        providerIdType: 'merchantName',
        config: '{"user":"mika","merchant":"Mika","terminal":"MIKA","pwd":"MIKA"}'
      },
      {
        id: 2,
        name: 'Midtrans GOPAY sandbox configuration',
        handler: 'midtrans',
        providerIdReference: 'G242671487',
        providerIdType: 'merchantId',
        config: '{"clientKey":"SB-Mid-client-VsVCzQXfi43aq964","serverKey":"SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF","merchantId":"G242671487","serverAuth":"Basic U0ItTWlkLXNlcnZlci1vaEtSaG5DaGtVY3RDV3lLdldIdWJpVkY6Og=="}'
      },
      {
        id: 3,
        name: 'Alto (WeChat Pay/Alipay) Default Configuration',
        handler: 'alto',
        providerIdReference: '101876',
        providerIdType: 'mch_id',
        config: '{"mch_id":"101876","pemPrivateKey":"-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCI0gQQA0ME5BcRBH3+V6HO94TSsnLSB6TGNnY77T5bu7iYkiPmGk72VYSkvd82bnKSPTZQlb6I7aIaCDUtGT4j5zFL3mGdCEKVmXZUUZlU/fmylRXqJs7r8T4q6rndTkqYea7z+MenBTTKLMk54MeY/fpjSvqvv8/Xi6XEuOwlrQIDAQABAoGAJB51Lhj+V0szf62U6VEPCUk0ij7LqwCTkjQMcHOH88WRzM0/pt4pHESlOKxbQc5UdqCsNwfg/drl4UNrblVsnsDUSFl8akhDYi/v/CuBvFGt1XnXOzHtshY50XEkQ1YtSZCWSJG6hOC7U1/Hg3/xkKgl/tUgXdvGft1EoDMY6G0CQQDFbcx5GkDdVrIXakwuzHmzG/sagYEpzSfYGkMidfyS68vf0du5N1KWeWBGcqPrEljlBJ87pvTwsdrkbs3V2s0bAkEAsWkpC3Nehm4UUWhCQ/JPWkg41mnHp/TRjLg/obV+44UJvk98makPpzVlrl0MQPLt8yEx4VId+a6ww4OH9Y/s1wJATb7/VnFQOdl6KF5jwcoj4rSSHc4B30Q6/I7bAScVX4YbsvghXr66dyc1EojypA+FkipPyl3k9yQS3wIDbMPNIQJBAKlqCZb0scRfpCllDTqDTsGhDB28X7uErwLZA3KxtZ0g8v/4Ob0m01rSQ+ow0r3G/fFZtp87YoKHDid2GEQoD3sCQCo6LFz6I2oRftUdUtKniYkUbYPEPysXu4PZ/pjPGAQ6Oj3OwsjYQ14MFN9nQoLryjSuS1JF/1/ACVMNMpByTlc=\n-----END RSA PRIVATE KEY-----\n","pemAltoPublicKey":"-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFl1/W6zIMQwkSzPUUKzyklYo5q0EhI3U129MtLugc9lmPique9UVSEt+ouLooJEdQ+0cA0gBAWRpb4E6MmCdZa8w9dKbOETBUfv72E1jTkQYtK/lCrQhbAEW9yJIOoqmCg+c/+ma612udql5VliTz8sPnsZp9wzEKVw/qVE3t7QIDAQAB\n-----END PUBLIC KEY-----\n"}'
      },
      {
        id: 4,
        handler: 'fairpay',
        name: 'Sandbox Config for Fairpay Debit Gateway'
      },
      {
        id: 5,
        handler: 'fairpay',
        name: 'Sandbox Config for Fairpay Credit Gateway'
      },
      {
        id: 6,
        handler: 'fairpay',
        name: 'Sandbox Config for Fairpay'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paymentProviderConfig', null, {})
  }
}
