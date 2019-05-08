'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('paymentProviderConfigKv', [
      {
        paymentProviderConfigId: 1,
        name: 'tcashUser',
        value: 'mika'
      },
      {
        paymentProviderConfigId: 1,
        name: 'tcashMerchant',
        value: 'Mika'
      },
      {
        paymentProviderConfigId: 1,
        name: 'tcashTerminal',
        value: 'MIKA'
      },
      {
        paymentProviderConfigId: 1,
        name: 'tcashPwd',
        value: 'MIKA'
      },

      {
        paymentProviderConfigId: 2,
        name: 'midtransMerchantId',
        value: 'G242671487'
      },
      {
        paymentProviderConfigId: 2,
        name: 'midtransClientKey',
        value: 'SB-Mid-client-VsVCzQXfi43aq964'
      },
      {
        paymentProviderConfigId: 2,
        name: 'midtransServerKey',
        value: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF'
      },
      {
        paymentProviderConfigId: 2,
        name: 'midtransServerAuth',
        value: 'Basic U0ItTWlkLXNlcnZlci1vaEtSaG5DaGtVY3RDV3lLdldIdWJpVkY6Og=='
      },

      {
        paymentProviderConfigId: 3,
        name: 'altoMchId',
        value: '101876'
      },
      {
        paymentProviderConfigId: 3,
        name: 'altoPemPrivateKey',
        value: '-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCI0gQQA0ME5BcRBH3+V6HO94TSsnLSB6TGNnY77T5bu7iYkiPmGk72VYSkvd82bnKSPTZQlb6I7aIaCDUtGT4j5zFL3mGdCEKVmXZUUZlU/fmylRXqJs7r8T4q6rndTkqYea7z+MenBTTKLMk54MeY/fpjSvqvv8/Xi6XEuOwlrQIDAQABAoGAJB51Lhj+V0szf62U6VEPCUk0ij7LqwCTkjQMcHOH88WRzM0/pt4pHESlOKxbQc5UdqCsNwfg/drl4UNrblVsnsDUSFl8akhDYi/v/CuBvFGt1XnXOzHtshY50XEkQ1YtSZCWSJG6hOC7U1/Hg3/xkKgl/tUgXdvGft1EoDMY6G0CQQDFbcx5GkDdVrIXakwuzHmzG/sagYEpzSfYGkMidfyS68vf0du5N1KWeWBGcqPrEljlBJ87pvTwsdrkbs3V2s0bAkEAsWkpC3Nehm4UUWhCQ/JPWkg41mnHp/TRjLg/obV+44UJvk98makPpzVlrl0MQPLt8yEx4VId+a6ww4OH9Y/s1wJATb7/VnFQOdl6KF5jwcoj4rSSHc4B30Q6/I7bAScVX4YbsvghXr66dyc1EojypA+FkipPyl3k9yQS3wIDbMPNIQJBAKlqCZb0scRfpCllDTqDTsGhDB28X7uErwLZA3KxtZ0g8v/4Ob0m01rSQ+ow0r3G/fFZtp87YoKHDid2GEQoD3sCQCo6LFz6I2oRftUdUtKniYkUbYPEPysXu4PZ/pjPGAQ6Oj3OwsjYQ14MFN9nQoLryjSuS1JF/1/ACVMNMpByTlc=\n-----END RSA PRIVATE KEY-----\n'
      },
      {
        paymentProviderConfigId: 3,
        name: 'altoPemPublicKey',
        value: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFl1/W6zIMQwkSzPUUKzyklYo5q0EhI3U129MtLugc9lmPique9UVSEt+ouLooJEdQ+0cA0gBAWRpb4E6MmCdZa8w9dKbOETBUfv72E1jTkQYtK/lCrQhbAEW9yJIOoqmCg+c/+ma612udql5VliTz8sPnsZp9wzEKVw/qVE3t7QIDAQAB\n-----END PUBLIC KEY-----\n'
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paymentProviderConfigKv', null, {})
  }
}
