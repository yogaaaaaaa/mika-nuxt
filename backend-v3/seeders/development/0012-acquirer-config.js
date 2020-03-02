'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('acquirerConfig', [
      {
        id: 1,
        name: 'Mika Tcash/LinkAja',
        handler: 'tcash',
        config: JSON.stringify({
          tcashUser: 'mika',
          tcashMerchant: 'Mika',
          tcashTerminal: 'MIKA',
          tcashPwd: 'MIKA'
        })
      },
      {
        id: 2,
        name: 'Mika Midtrans GOPAY Sandbox',
        handler: 'midtrans',
        config: JSON.stringify({
          baseUrl: 'https://api.sandbox.midtrans.com',
          midtransClientKey: 'SB-Mid-client-VsVCzQXfi43aq964',
          midtransServerKey: 'SB-Mid-server-ohKRhnChkUctCWyKvWHubiVF',
          midtransMerchantId: 'G242671487'
        })
      },
      {
        id: 3,
        name: 'Mika Alto (WeChat Pay/Alipay)',
        handler: 'alto',
        config: JSON.stringify({
          altoMchId: '101876',
          altoPemPrivateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCI0gQQA0ME5BcRBH3+V6HO94TSsnLSB6TGNnY77T5bu7iYkiPmGk72VYSkvd82bnKSPTZQlb6I7aIaCDUtGT4j5zFL3mGdCEKVmXZUUZlU/fmylRXqJs7r8T4q6rndTkqYea7z+MenBTTKLMk54MeY/fpjSvqvv8/Xi6XEuOwlrQIDAQABAoGAJB51Lhj+V0szf62U6VEPCUk0ij7LqwCTkjQMcHOH88WRzM0/pt4pHESlOKxbQc5UdqCsNwfg/drl4UNrblVsnsDUSFl8akhDYi/v/CuBvFGt1XnXOzHtshY50XEkQ1YtSZCWSJG6hOC7U1/Hg3/xkKgl/tUgXdvGft1EoDMY6G0CQQDFbcx5GkDdVrIXakwuzHmzG/sagYEpzSfYGkMidfyS68vf0du5N1KWeWBGcqPrEljlBJ87pvTwsdrkbs3V2s0bAkEAsWkpC3Nehm4UUWhCQ/JPWkg41mnHp/TRjLg/obV+44UJvk98makPpzVlrl0MQPLt8yEx4VId+a6ww4OH9Y/s1wJATb7/VnFQOdl6KF5jwcoj4rSSHc4B30Q6/I7bAScVX4YbsvghXr66dyc1EojypA+FkipPyl3k9yQS3wIDbMPNIQJBAKlqCZb0scRfpCllDTqDTsGhDB28X7uErwLZA3KxtZ0g8v/4Ob0m01rSQ+ow0r3G/fFZtp87YoKHDid2GEQoD3sCQCo6LFz6I2oRftUdUtKniYkUbYPEPysXu4PZ/pjPGAQ6Oj3OwsjYQ14MFN9nQoLryjSuS1JF/1/ACVMNMpByTlc=\n-----END RSA PRIVATE KEY-----\n',
          altoPemPublicKey: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFl1/W6zIMQwkSzPUUKzyklYo5q0EhI3U129MtLugc9lmPique9UVSEt+ouLooJEdQ+0cA0gBAWRpb4E6MmCdZa8w9dKbOETBUfv72E1jTkQYtK/lCrQhbAEW9yJIOoqmCg+c/+ma612udql5VliTz8sPnsZp9wzEKVw/qVE3t7QIDAQAB\n-----END PUBLIC KEY-----\n'
        })
      },
      {
        id: 4,
        name: 'Mika QR Nasional (QRIS) via Tcash QRN',
        handler: 'tcashqrn',
        config: JSON.stringify({
          tcashQrnMerchantCriteria: 'UMI',
          tcashQrnMerchantID: '190717011228001'
        })
      },
      {
        id: 5,
        name: 'Mika Midtrans Production',
        handler: 'midtrans',
        config: JSON.stringify({
          baseUrl: 'https://api.midtrans.com',
          midtransClientKey: 'Mid-client-lZD4hDhQ5A8kEc5L',
          midtransServerKey: 'Mid-server-9bJvFxhcuPpuFdj_3SseEocr',
          midtransMerchantId: 'G314363658'
        })
      },

      {
        id: 100,
        name: 'Kuma Pay',
        handler: 'kumapay',
        config: JSON.stringify({})
      },
      {
        id: 101,
        name: 'Kuma Bank',
        handler: 'kumabank',
        config: JSON.stringify({})
      }
    ]
    , {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('acquirerConfig', null, {})
  }
}
