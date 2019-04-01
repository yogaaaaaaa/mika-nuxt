'use strict'

const configName = 'pgAltoConfig'

const appConfig = require('./appConfig')

const pemPrivateKey =
`-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCI0gQQA0ME5BcRBH3+V6HO94TSsnLSB6TGNnY77T5bu7iYkiPmGk72VYSkvd82bnKSPTZQlb6I7aIaCDUtGT4
j5zFL3mGdCEKVmXZUUZlU/fmylRXqJs7r8T4q6rndTkqYea7z+MenBTTKLMk54MeY/fpjSvqvv8/Xi6XEuOwlrQIDAQABAoGAJB
51Lhj+V0szf62U6VEPCUk0ij7LqwCTkjQMcHOH88WRzM0/pt4pHESlOKxbQc5UdqCsNwfg/drl4UNrblVsnsDUSFl8akhDYi/v/
CuBvFGt1XnXOzHtshY50XEkQ1YtSZCWSJG6hOC7U1/Hg3/xkKgl/tUgXdvGft1EoDMY6G0CQQDFbcx5GkDdVrIXakwuzHmzG/sa
gYEpzSfYGkMidfyS68vf0du5N1KWeWBGcqPrEljlBJ87pvTwsdrkbs3V2s0bAkEAsWkpC3Nehm4UUWhCQ/JPWkg41mnHp/TRjLg
/obV+44UJvk98makPpzVlrl0MQPLt8yEx4VId+a6ww4OH9Y/s1wJATb7/VnFQOdl6KF5jwcoj4rSSHc4B30Q6/I7bAScVX4Ybsv
ghXr66dyc1EojypA+FkipPyl3k9yQS3wIDbMPNIQJBAKlqCZb0scRfpCllDTqDTsGhDB28X7uErwLZA3KxtZ0g8v/4Ob0m01rSQ
+ow0r3G/fFZtp87YoKHDid2GEQoD3sCQCo6LFz6I2oRftUdUtKniYkUbYPEPysXu4PZ/pjPGAQ6Oj3OwsjYQ14MFN9nQoLryjSu
S1JF/1/ACVMNMpByTlc=
-----END RSA PRIVATE KEY-----`

const pemAltoPublicKey =
`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFl1/W6zIMQwkSzPUUKzyklYo5q0EhI3U129MtLugc9lmPique9UVSEt+ouLoo
JEdQ+0cA0gBAWRpb4E6MmCdZa8w9dKbOETBUfv72E1jTkQYtK/lCrQhbAEW9yJIOoqmCg+c/+ma612udql5VliTz8sPnsZp9wzEK
Vw/qVE3t7QIDAQAB
-----END PUBLIC KEY-----`

/**
 * Default Config for alto/wechat payment gateway
 */
let baseConfig = {
  baseUrl: 'https://pay.altopay.co.id',
  notifyEndpoint: '/payment/alto/notif',
  pemPrivateKey: pemPrivateKey,
  pemAltoPublicKey: pemAltoPublicKey,
  mch_id: '101876',
  notify_url: null,
  currency: 'IDR',
  trade_type: 'QR_CODE'
}
baseConfig.notify_url = `${appConfig.apiBaseUrl}${baseConfig.notifyEndpoint}`

/**
 * Load external config file '${configName}_extra.js' as extraConfig, in same directory
 * And create a mixin between baseConfig and extraConfig
 */
try {
  let extraBaseConfig = require(`./${configName}_extra`)
  baseConfig = Object.assign({}, baseConfig, extraBaseConfig)
  console.log(`config ${configName} is mixed`)
} catch (error) { }

module.exports = baseConfig
