'use strict'

/**
 * Default Config for Dana payment gateway
 */

const danaDevPubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnaKVGRbin4Wh4KN35OPh
ytJBjYTz7QZKSZjmHfiHxFmulfT87rta+IvGJ0rCBgg+1EtKk1hX8G5gPGJs1htJ
5jHa3/jCk9l+luzjnuT9UVlwJahvzmFw+IoDoM7hIPjsLtnIe04SgYo0tZBpEmkQ
vUGhmHPqYnUGSSMIpDLJDvbyr8gtwluja1SbRphgDCoYVXq+uUJ5HzPS049aaxTS
nfXh/qXuDoB9EzCrgppLDS2ubmk21+dr7WaO/3RFjnwx5ouv6w+iC1XOJKar3CTk
X6JV1OSST1C9sbPGzMHZ8AGB51BM0mok7davD/5irUk+f0C25OgzkwtxAt80dkDo
/QIDAQAB
-----END PUBLIC KEY-----`

const danaPubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1Cw3SPt9Nb1Jljuelo18
hohlwXxrnhDqMh/P5Vra5aIGjsUoQnnB6LDXWsto3sYXZAG99X0lCsFHHtfOfdYT
5e+xMtB/RDD1kfSBozvhzbba/2ZudA3rs1XDiEUnXbAc5XnDIGbK/XDzEJGrDs3/
xAUCXhK8wc47FfxKxErk/Ivy/wbdgL8INa+tlOwYy9ZqVtj3Ek5BsZikQ4C1hfVL
21A823v9m13qHzY26gUFRZj2t7U7e/pOF1eYCcMFbvdqBR4ri9dd4RFPt6H9XUl0
K3WiVM+qt1nVfYAFH7Xqyho3jhIsQpAB1O1ZTdE+mRPWUe+JbI8WIFmJZGS8/iq9
nQIDAQAB
-----END PUBLIC KEY-----`

const mikaDevPubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAthOapvbZjrPwzN20r8Nx
DiJi0xbTJpmV5Hk1Wu4LGvRDl552yoQFPtCXX8tRogDIJ+7e4mcPsK4QcQz6QxBG
cP4rdvrTTzNS1KEZWzWJQhnT32KIwN4NbikZRnyFoJMH7qI5u3XRo4jNfr1iimNg
WUbwGMYlfkJb9MThUvrxOUtB6eNUYyaF1RtH2EkzMRs3A7wvjkNlL4sGmlXycO+u
w8I4JnTvv9l61qPTebREgx0WbvcrSaneSm0bV97tSTsyli4rZ1MTC3OILPNhvgiG
C7LjdxuOxdL1ku54OSWJlX//xUO1eGMo1TFjM5vVK4OgYWqFTUOIUGO7b4tMLDAF
UQIDAQAB
-----END PUBLIC KEY-----`

const mikaPubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvPfx1ma6qrOVNIPlKNf3
MxQSLx9ybSxB6EB3iozb869y8tuuU6AjwONfZNAdN1OP8nO4QoK9Tl0CoijFexTt
QLKogwkXem62rID7ZP4OGtigUY5i69a0UJW5xertMfDuLrsg7BhHLrsKDY4889kG
Z3w8+ptmzelVqLFyDmQB+fIZ3qt8VXrYdJB/Q9qdHHWyawS0vYhjmnW0k/re9LgU
kzP6+6xSAovMApzcQ1aN+OGSkhahJSQYeNYxxnPDgBCg9ABX+dUqQ29aqO1aP3BL
uUhLAIaTHPejJMWUg1Fq2ik5Z2sfZNIGZP46jy828oALv2j7+2oJri7ZQji8lOIK
cwIDAQAB
-----END PUBLIC KEY-----`

const mikaDevPrivKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAthOapvbZjrPwzN20r8NxDiJi0xbTJpmV5Hk1Wu4LGvRDl552
yoQFPtCXX8tRogDIJ+7e4mcPsK4QcQz6QxBGcP4rdvrTTzNS1KEZWzWJQhnT32KI
wN4NbikZRnyFoJMH7qI5u3XRo4jNfr1iimNgWUbwGMYlfkJb9MThUvrxOUtB6eNU
YyaF1RtH2EkzMRs3A7wvjkNlL4sGmlXycO+uw8I4JnTvv9l61qPTebREgx0Wbvcr
SaneSm0bV97tSTsyli4rZ1MTC3OILPNhvgiGC7LjdxuOxdL1ku54OSWJlX//xUO1
eGMo1TFjM5vVK4OgYWqFTUOIUGO7b4tMLDAFUQIDAQABAoIBAHpR2Ufp9maERHWd
TFH4Pu978mBVqSz5aVXAiDO6UAOfrfkiIDQVVWDJyag1c3YeiFkrhNkc29GaXrlU
OpzrRieK2bBo+aTvmen3AI3h/YBG0av1CmJnyyYCvlQ4O52QqXeLzLU/hcMTmNpY
aOcHtCbGHW7HT1DvS8+4pJeWtpAB+FtAulrpStnbr1abaRyucSDgdKFpjvowzBe6
y5FIb9sFI9eECKI2Vac8heLvEIPaw9rtMjd6YeSYHePYntH0yovngJk7kKarM/jx
Sstv9ue80GayPNZJcNtczgaZX9eqpCYh6NSsTKi2nntSwRKCpXow11ridRDgGPLZ
/14dTzECgYEA5vZN6SD3oiSU5pm29M7/aUZQkEmmEm1p8I13dVmC+dEbAMw9yBpi
BM3cYKJ9IjB6AygvGmS8kiqUg+u6oMFaL3smJZgUjlqZS5/jUpqXFDCxTEwjUtSL
+Is2H5+f8YBfb0K6K3iqr6Zwi/Mnf5Q83t4ZVJrDNsfi9P5RK9PAP9sCgYEAydCe
5hvnFPpgmh63FfvSpZ+77EmUOicjxVGmNWMJP9L4WLNROeQJVeftHrJYlQmErcrV
eqrZMc1ohTYxKxgahqvwh33RN+dG4dghyH/4a43oZr9o4AA4Cd0l/8f4rvBjdJKY
tZG6L8xIjjXpUcTu7x3sICOj+SI7LUWOBy4CnUMCgYEAiF7WEdjNXoeLA72vMU0n
sdk6qHdT/31rGAXvivKXSzoUX5w4vnYVehCzFrvadt14rXSEm2jvjr5lgp8lStXf
kjl8hKYPPR5xdR2q85MjsWAuz4YFNVsaal6ITpPJtKa/ssoLcq+E2MHFolyn7cRx
TIaHHlVi/m13rICdHOuikBECgYBL9Bkpb0zr50NeHbs4KdtgfBqE1jhUHpDm3VDZ
fNlpTOQstegXCoy86Rmj2OlfxgJKSjFIBm7RwIXaxMeCeYLaNnHC/IY2LPPPYcFt
LUR4biMOMHGvBEYS6Ek516/vXwd/QwD4LM1O2epgo0eZf62RDsjkW6WFyO1On4PR
je5r8wKBgCtEAWH2l7EizasM7OTD6UxXnfq2oMHb/ue1YVxLCD+rP2ud4At4/Lno
8/N17TgagredpdbVrsUMMOCtDocfcO2r41YoOK6evx7MiHcq374f9cO3xYT2cY/M
AwCl8c22Ub3aizx3Yp9G0maC1t6FHHdUyWAd+nJdf+wcJS3RYGkW
-----END RSA PRIVATE KEY-----`

const mikaPrivKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvPfx1ma6qrOVNIPlKNf3MxQSLx9ybSxB6EB3iozb869y8tuu
U6AjwONfZNAdN1OP8nO4QoK9Tl0CoijFexTtQLKogwkXem62rID7ZP4OGtigUY5i
69a0UJW5xertMfDuLrsg7BhHLrsKDY4889kGZ3w8+ptmzelVqLFyDmQB+fIZ3qt8
VXrYdJB/Q9qdHHWyawS0vYhjmnW0k/re9LgUkzP6+6xSAovMApzcQ1aN+OGSkhah
JSQYeNYxxnPDgBCg9ABX+dUqQ29aqO1aP3BLuUhLAIaTHPejJMWUg1Fq2ik5Z2sf
ZNIGZP46jy828oALv2j7+2oJri7ZQji8lOIKcwIDAQABAoIBAF5fjb2/zFXYHhn+
DQJa6S/vRC2YjPMM+VVebNUbB/Ypl0TGhcdp4LFCXK/iZ9TrvKYfONSuqpBqTxhh
OE8B4oM/Nn1KmxkgFccNG4ASiUTLDzXr4Gdb8O2V+RNpAlDAvJNGDWkbruEdtCWU
9cfqiRJBr8qQtcT8VTVMeWPKeloyvDxDngiS3yPM4fDRiYn6iVlkFSNMIjIooCdy
eQMprb7Xc2WeNnybxIUondn83ovD8PLM5LLXEyboyd9gbjH+4jIjGiY7YqjnZqrn
qxxKB4kWx9BRByblGHX+gWP6J6u6OjT3MBdRQuYji247z8BPUUYSR61Li9z1ZL/a
KLJhe0ECgYEA8HYODlpGotTvobYOzgGt7LwP2Menv44u3Dl+MHJvrc94cPWskV/i
Wa7r3wMm4/kJ9CNRdS2s1EIr9AXtTx+cQ1LinRNxC7fCC0EV+ht0R1u056+Zj8zU
IAmiWWlyoQLVbBWdtoCwtSLNjCSa/ePRp/ig/0yGrhvSxdW+1JS4/hECgYEAyS4M
Vk/Lgx1KIFI3KkLPgVLOo45fXq8ZikcpsPO8s3l3GTpgFQYScz4cTxdGE5XrMtFW
wDAAgPi7+XPrGx0aNntz8+ym6JcUkutFuN5pFRhOMPfI3aUcPjyDNNMKq5KTmGOz
7zb/NrOBb0BFLZ8LHCK8La5Iu1nIxEZ8z8PizEMCgYAgbHrGuquNp1LMpmTmqFlQ
c6dbXsiizsRI08PNOpEOicw+xxHG5Hv8BdcuUhl7YghSkDSarVcBpA6TL/1ozuVe
Op3t+kIjB1s180fIWs1aFeaV2xrExiTQURxAHDTluyEWGvASPNYXBqNaw1DW7VJG
6QKkiiga8AuCu6iot4keUQKBgEgQirLQWqJY95ikWsZ0sEgvFX5ZHaiZKJjz7OdK
KCpSNGuBEbH2Pt2xPgrG139kkJ/fhSfLCiMo9ozhDTLlNeKWTm7uMsvWcrQ+OveC
FDpOPpQj7nwXDQruOkHN52CWXPCVpnrmRH2fx5nGeAFjm2M0vhvO9pbGDrjgVw1F
qhRpAoGBAOIVsj8mtVBmN0x9/aKQWKhze6CDAIZbb9o8hSEk9gc6WP+scdFiMzuJ
BjeQGofAE2jqFMfDD4hnLM6UdQ38RwlNSkXAO+RcBosfFKT770VUTQvwv3P6xDLL
nRe3t1clxsKjwovD3bYHDiP/I5DxkrRpAEyGnzsHUQ13oJks5wQ3
-----END RSA PRIVATE KEY-----`

const isEnvProduction = process.env.NODE_ENV === 'production'
const danaErrors = [
  'REPEAT_REQ_INCONSISTENT',
  'CURRENCY_NOT_CORRECT',
  'AMOUNT_EXCEEDS_LIMIT',
  'ACCESS_DENIED',
  'MERCHANT_STATUS_ABNORMAL',
  'USER_STATUS_ABNORMAL',
  'RISK_REJECT',
  'USER_PAYING',
  'ORDER_IS_CLOSED',
  'ORDER_STATUS_INVALID',
  'PAYMENT_IN_PROCESS',
  'PROCESS_FAIL',
  'ACCOUNT_STATUS_ABNORMAL',
  'BALANCE_NOT_ENOUGH',
  'WITHOUT_AVAILABLE_PAY_METHOD',
  'USER_BOUND_ASSET_NOT_EXIST',
  'CHANNEL_STATUS_NOT_ENABLE',
  'CHANNEL_OVER_LIMIT',
  'MERCHANT_AND_SHOP_NOT_MATCH',
  'SHOP_NOT_EXIST',
  'SHOP_STATUS_ABNORMAL',
  'ACCOUNT_IS_FROZEN',
  'USER_TYPE_ILLEGAL',
  'PAYER_AMOUNT_EXCEED_DAILY_LIMIT',
  'PAYER_AMOUNT_EXCEED_MONTHLY_LIMIT',
  'PARAM_MISSING',
  'PARAM_ILLEGAL',
  'INVALID_SIGNATURE',
  'KEY_NO_FOUND',
  'NO_INTERFACE_DEF',
  'API_IS_INVALID',
  'MSG_PARSE_ERROR',
  'OAUTH_FAILED',
  'FUNCTION_NOT_MATCH',
  'SYSTEM_ERROR',
  'VERIFY_CLIENT_SECRET_FAIL',
  'CLIENT_FORBIDDEN_ACCESS_API',
  'UNKNOWN_CLIENT',
  'INVALID_CLIENT_STATUS',
  'ACCESS_TOKEN_NOT_EXIST',
  'ACCESS_TOKEN_EXPIRY',
  'AUTHORIZATION_EXPIRY',
  'TOO_MANY_REQUESETS',
  'INVALID_QRIS_BIZ_TYPE',
  'ORDER_NOT_EXISTS',
  'TARGET_NOT_FOUND'
]

let baseConfig = {
  baseUrl: isEnvProduction
    ? 'https://api.saas.dana.id'
    : 'https://api-sandbox.saas.dana.id',
  notifEndpoint: '/dana/acquiring/order/finishNotify.htm',
  createQrisEndpoint: '/dana/mobile/create/qris.htm',
  queryTransaction: '/dana/acquiring/order/query.htm',
  cancelTransaction: '/dana/acquiring/order/cancel.htm',
  refundTransaction: '/dana/acquiring/refund/syncRefund.htm',
  createDivision: '/dana/merchant/division/createDivision.htm',
  updateDivision: '/dana/merchant/division/updateDivision.htm',
  createShop: '/dana/merchant/shop/createShop.htm',
  updateShop: '/dana/merchant/shop/updateShop.htm',
  merchantId: isEnvProduction ? '216620000093089864101' : '216620000000513774332',
  clientId: isEnvProduction ? '2020033083427546571589' : '2019112717393632882114',
  clientSecret: isEnvProduction ? '7114b0cd786d3880713518db6d516950' : 'dfe8db76ba0f73dbb3248c5b6fc00990',
  danaMikaNotifEndpoint: '/dana/notification',
  danaErrors,
  danaPubKey: isEnvProduction ? danaPubKey : danaDevPubKey,
  mikaPubKey: isEnvProduction ? mikaPubKey : mikaDevPubKey,
  mikaPrivKey: isEnvProduction ? mikaPrivKey : mikaDevPrivKey
}

// Load external config file
baseConfig = require('./helper').loadAndMerge(__filename, baseConfig)

module.exports = baseConfig
