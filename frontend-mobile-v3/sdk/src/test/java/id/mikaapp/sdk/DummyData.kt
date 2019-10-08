package id.mikaapp.sdk

import com.google.gson.Gson
import id.mikaapp.sdk.models.LoginResponse

internal val loginCorrectAccountResponseDummy = """
        {
    "version": "andra-dev4-24577dc-101 development sandbox 2019-07-03T03:32:01.000Z",
    "status": "auth-200",
    "message": "Login success",
    "isError": false,
    "data": {
        "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIzLCJ1c2VybmFtZSI6ImFnZW50MyIsInVzZXJUeXBlIjoiYWdlbnQiLCJhZ2VudElkIjozLCJvdXRsZXRJZCI6MSwibWVyY2hhbnRJZCI6MSwiaWF0IjoxNTYyMjMyMDk4fQ.Wkup1yTgXAzcGptMk0LzQtNSEUZvhpbMWyHSAxeSKtk",
        "authExpirySecond": 21600,
        "publicDetails": {
            "thumbnailsBaseUrl": "https://sboxapi.mikaapp.id/thumbnails"
        },
        "userId": 23,
        "username": "agent3",
        "userType": "agent",
        "agentId": 3,
        "outletId": 1,
        "merchantId": 1,
        "brokerDetail": {
            "brokerUrl": "wss://sboxbroker.mikaapp.id",
            "user": "sandboxagent3",
            "password": "+7uPO/NqbxmejZtLqED0fU2D",
            "clientId": "sandboxagent3",
            "cleanSession": false,
            "clientTopic": "sandboxmika-v3-dev/notif-client/sandboxagent3",
            "serverTopic": "sandboxmika-v3-dev/notif-server/sandboxagent3",
            "broadcastTopic": "sandboxmika-v3-dev/notif-broadcast"
        }
    }
}
    """.trimIndent()
internal val loginInvalidAccountResponseDummy = """
        {
    "version": "andra-dev4-24577dc-101 development sandbox 2019-07-03T03:32:01.000Z",
    "status": "auth-400",
    "message": "Invalid credential for authentication",
    "isError": true
}
    """.trimIndent()
internal val loginResponseDummy = Gson().fromJson(loginCorrectAccountResponseDummy, LoginResponse::class.java)

internal val checkLoginSessionValidResponseDummy = """
    {
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-202",
    "message": "Session token is still valid",
    "isError": false,
    "data": {
        "userId": 23,
        "username": "agent3",
        "userType": "agent",
        "agentId": 3,
        "outletId": 1,
        "merchantId": 1,
        "iat": 1562745542
        }
    }
""".trimIndent()
internal val checkLoginSessionInvalidResponseDummy = """
{
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-404",
    "message": "Invalid session token",
    "isError": true
}
""".trimIndent()

internal val logoutSuccessDummyRaw = """
{
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-201",
    "message": "Logout success",
    "isError": false
}
""".trimIndent()
internal val logoutNotAuthenticatedDummyRaw = """
{
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-401",
    "message": "Not authenticated",
    "isError": true
}
""".trimIndent()

internal val getAcquirersAgentAuthenticatedDummyRaw = """
    {
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "ent-200",
    "message": "Entity(s) found",
    "isError": false,
    "data": [
        {
            "id": 1,
            "name": "LinkAja Maju Tembak",
            "description": null,
            "minimumAmount": "100.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 1,
            "acquirerTypeId": 1,
            "acquirerType": {
                "id": 1,
                "class": "linkaja",
                "name": "LinkAja",
                "description": null,
                "thumbnail": "linkaja.png",
                "thumbnailGray": "linkaja-gray.png",
                "chartColor": "#EE1B1F"
            },
            "acquirerConfig": {
                "id": 1,
                "name": "Tcash/LinkAja Default configuration",
                "description": null,
                "handler": "tcash",
                "sandbox": true,
                "merchantId": null
            },
            "_handler": {
                "name": "tcash",
                "classes": [
                    "linkaja",
                    "tcash"
                ],
                "defaultMaximumAmount": null,
                "defaultMinimumAmount": 100,
                "properties": {
                    "flows": [
                        "flowProvideToken"
                    ],
                    "tokenTypes": [
                        "tokenQrCodeContent"
                    ],
                    "userTokenTypes": []
                }
            }
        },
        {
            "id": 2,
            "name": "Gopay Maju Tembak",
            "description": null,
            "minimumAmount": "1.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 2,
            "acquirerTypeId": 2,
            "acquirerType": {
                "id": 2,
                "class": "gopay",
                "name": "GO-PAY",
                "description": null,
                "thumbnail": "gopay.png",
                "thumbnailGray": "gopay-gray.png",
                "chartColor": "#5DA4DA"
            },
            "acquirerConfig": {
                "id": 2,
                "name": "Midtrans GOPAY Default Sandbox configuration",
                "description": null,
                "handler": "midtrans",
                "sandbox": true,
                "merchantId": null
            },
            "_handler": {
                "name": "midtrans",
                "classes": [
                    "gopay"
                ],
                "defaultMaximumAmount": null,
                "defaultMinimumAmount": 1,
                "properties": {
                    "flows": [
                        "flowProvideToken"
                    ],
                    "tokenTypes": [
                        "tokenQrCodeUrlImage"
                    ],
                    "userTokenTypes": []
                }
            }
        },
        {
            "id": 3,
            "name": "Alipay Maju Tembak",
            "description": null,
            "minimumAmount": "1000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 3,
            "acquirerTypeId": 3,
            "acquirerType": {
                "id": 3,
                "class": "wechatpay",
                "name": "WeChat Pay",
                "description": null,
                "thumbnail": "wechatpay.png",
                "thumbnailGray": "wechatpay-gray.png",
                "chartColor": "#2CC200"
            },
            "acquirerConfig": {
                "id": 3,
                "name": "Alto (WeChat Pay/Alipay) Default Configuration",
                "description": null,
                "handler": "alto",
                "sandbox": true,
                "merchantId": null
            },
            "_handler": {
                "name": "alto",
                "classes": [
                    "wechatpay",
                    "alipay"
                ],
                "defaultMaximumAmount": 20000000,
                "defaultMinimumAmount": 1000,
                "properties": {
                    "flows": [
                        "flowGetToken"
                    ],
                    "tokenTypes": [
                        "tokenQrCodeContent"
                    ],
                    "userTokenTypes": []
                }
            }
        },
        {
            "id": 4,
            "name": "WeChat Pay Maju Tembak",
            "description": null,
            "minimumAmount": "1000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 3,
            "acquirerTypeId": 4,
            "acquirerType": {
                "id": 4,
                "class": "alipay",
                "name": "AliPay",
                "description": null,
                "thumbnail": "alipay.png",
                "thumbnailGray": "alipay-gray.png",
                "chartColor": "#01AAEE"
            },
            "acquirerConfig": {
                "id": 3,
                "name": "Alto (WeChat Pay/Alipay) Default Configuration",
                "description": null,
                "handler": "alto",
                "sandbox": true,
                "merchantId": null
            },
            "_handler": {
                "name": "alto",
                "classes": [
                    "wechatpay",
                    "alipay"
                ],
                "defaultMaximumAmount": 20000000,
                "defaultMinimumAmount": 1000,
                "properties": {
                    "flows": [
                        "flowGetToken"
                    ],
                    "tokenTypes": [
                        "tokenQrCodeContent"
                    ],
                    "userTokenTypes": []
                }
            }
        },
        {
            "id": 5,
            "name": "Kartu Debit Maju Tembak",
            "description": null,
            "minimumAmount": "25000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 10,
            "acquirerTypeId": 5,
            "acquirerType": {
                "id": 5,
                "class": "emvDebit",
                "name": "Kartu Debit",
                "description": null,
                "thumbnail": "card.png",
                "thumbnailGray": "card-gray.png",
                "chartColor": "#4A90D9"
            },
            "acquirerConfig": {
                "id": 10,
                "name": "Fairpay Default Configuration",
                "description": null,
                "handler": "fairpay",
                "sandbox": true,
                "merchantId": null
            },
            "_handler": {
                "name": "fairpay",
                "classes": [
                    "emvDebit",
                    "emvCredit"
                ],
                "defaultMaximumAmount": null,
                "defaultMinimumAmount": null,
                "properties": {
                    "flows": [
                        "flowGetToken",
                        "flowGateway"
                    ],
                    "tokenTypes": [],
                    "userTokenTypes": [
                        "userTokenEmvTagsMika_57_82_95_9A_9C_5F2A_5F34_9F02_9F03_9F10_9F1A_9F26_9F27_9F33_9F34_9F35_9F36_9F37"
                    ]
                }
            }
        },
        {
            "id": 6,
            "name": "Kartu Kredit Maju Tembak",
            "description": null,
            "minimumAmount": "25000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 10,
            "acquirerTypeId": 6,
            "acquirerType": {
                "id": 6,
                "class": "emvCredit",
                "name": "Kartu Kredit",
                "description": null,
                "thumbnail": "card.png",
                "thumbnailGray": "card-gray.png",
                "chartColor": "#192061"
            },
            "acquirerConfig": {
                "id": 10,
                "name": "Fairpay Default Configuration",
                "description": null,
                "handler": "fairpay",
                "sandbox": true,
                "merchantId": null
            },
            "_handler": {
                "name": "fairpay",
                "classes": [
                    "emvDebit",
                    "emvCredit"
                ],
                "defaultMaximumAmount": null,
                "defaultMinimumAmount": null,
                "properties": {
                    "flows": [
                        "flowGetToken",
                        "flowGateway"
                    ],
                    "tokenTypes": [],
                    "userTokenTypes": [
                        "userTokenEmvTagsMika_57_82_95_9A_9C_5F2A_5F34_9F02_9F03_9F10_9F1A_9F26_9F27_9F33_9F34_9F35_9F36_9F37"
                    ]
                }
            }
        }
    ]
}
""".trimIndent()
internal val getAcquirersAgentNotAuthenticatedDummyRaw = """
{
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-401",
    "message": "Not authenticated",
    "isError": true
}
""".trimIndent()

internal val getAcquirersMerchantAuthenticatedDummyRaw = """
    {
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "ent-200",
    "message": "Entity(s) found",
    "isError": false,
    "data": [
        {
            "id": 1,
            "name": "LinkAja Maju Tembak",
            "description": null,
            "minimumAmount": "100.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 1,
            "acquirerTypeId": 1,
            "acquirerType": {
                "id": 1,
                "class": "linkaja",
                "name": "LinkAja",
                "description": null,
                "thumbnail": "linkaja.png",
                "thumbnailGray": "linkaja-gray.png",
                "chartColor": "#EE1B1F"
            },
            "acquirerConfig": {
                "id": 1,
                "name": "Tcash/LinkAja Default configuration",
                "description": null,
                "handler": "tcash",
                "sandbox": true,
                "merchantId": null
            }
        },
        {
            "id": 2,
            "name": "Gopay Maju Tembak",
            "description": null,
            "minimumAmount": "1.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 2,
            "acquirerTypeId": 2,
            "acquirerType": {
                "id": 2,
                "class": "gopay",
                "name": "GO-PAY",
                "description": null,
                "thumbnail": "gopay.png",
                "thumbnailGray": "gopay-gray.png",
                "chartColor": "#5DA4DA"
            },
            "acquirerConfig": {
                "id": 2,
                "name": "Midtrans GOPAY Default Sandbox configuration",
                "description": null,
                "handler": "midtrans",
                "sandbox": true,
                "merchantId": null
            }
        },
        {
            "id": 3,
            "name": "Alipay Maju Tembak",
            "description": null,
            "minimumAmount": "1000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 3,
            "acquirerTypeId": 3,
            "acquirerType": {
                "id": 3,
                "class": "wechatpay",
                "name": "WeChat Pay",
                "description": null,
                "thumbnail": "wechatpay.png",
                "thumbnailGray": "wechatpay-gray.png",
                "chartColor": "#2CC200"
            },
            "acquirerConfig": {
                "id": 3,
                "name": "Alto (WeChat Pay/Alipay) Default Configuration",
                "description": null,
                "handler": "alto",
                "sandbox": true,
                "merchantId": null
            }
        },
        {
            "id": 4,
            "name": "WeChat Pay Maju Tembak",
            "description": null,
            "minimumAmount": "1000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 3,
            "acquirerTypeId": 4,
            "acquirerType": {
                "id": 4,
                "class": "alipay",
                "name": "AliPay",
                "description": null,
                "thumbnail": "alipay.png",
                "thumbnailGray": "alipay-gray.png",
                "chartColor": "#01AAEE"
            },
            "acquirerConfig": {
                "id": 3,
                "name": "Alto (WeChat Pay/Alipay) Default Configuration",
                "description": null,
                "handler": "alto",
                "sandbox": true,
                "merchantId": null
            }
        },
        {
            "id": 5,
            "name": "Kartu Debit Maju Tembak",
            "description": null,
            "minimumAmount": "25000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 10,
            "acquirerTypeId": 5,
            "acquirerType": {
                "id": 5,
                "class": "emvDebit",
                "name": "Kartu Debit",
                "description": null,
                "thumbnail": "card.png",
                "thumbnailGray": "card-gray.png",
                "chartColor": "#4A90D9"
            },
            "acquirerConfig": {
                "id": 10,
                "name": "Fairpay Default Configuration",
                "description": null,
                "handler": "fairpay",
                "sandbox": true,
                "merchantId": null
            }
        },
        {
            "id": 6,
            "name": "Kartu Kredit Maju Tembak",
            "description": null,
            "minimumAmount": "25000.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": 10,
            "acquirerTypeId": 6,
            "acquirerType": {
                "id": 6,
                "class": "emvCredit",
                "name": "Kartu Kredit",
                "description": null,
                "thumbnail": "card.png",
                "thumbnailGray": "card-gray.png",
                "chartColor": "#192061"
            },
            "acquirerConfig": {
                "id": 10,
                "name": "Fairpay Default Configuration",
                "description": null,
                "handler": "fairpay",
                "sandbox": true,
                "merchantId": null
            }
        },
        {
            "id": 1007,
            "name": "LinkAja Toko Makmur",
            "description": null,
            "minimumAmount": "1.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": null,
            "acquirerTypeId": 1,
            "acquirerType": {
                "id": 1,
                "class": "linkaja",
                "name": "LinkAja",
                "description": null,
                "thumbnail": "linkaja.png",
                "thumbnailGray": "linkaja-gray.png",
                "chartColor": "#EE1B1F"
            },
            "acquirerConfig": null
        },
        {
            "id": 1010,
            "name": "LinkAja Toko Makmur",
            "description": null,
            "minimumAmount": "1.00",
            "maximumAmount": null,
            "gateway": false,
            "hidden": false,
            "merchantId": 1,
            "acquirerConfigId": null,
            "acquirerTypeId": 1,
            "acquirerType": {
                "id": 1,
                "class": "linkaja",
                "name": "LinkAja",
                "description": null,
                "thumbnail": "linkaja.png",
                "thumbnailGray": "linkaja-gray.png",
                "chartColor": "#EE1B1F"
            },
            "acquirerConfig": null
        }
    ]
}
""".trimIndent()
internal val getAcquirersMerchantNotAuthenticatedDummyRaw = """
    {
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-401",
    "message": "Not authenticated",
    "isError": true
}
""".trimIndent()

internal val getTransactionsDummyRaw = """
    {
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "ent-200",
    "message": "Entity(s) found",
    "isError": false,
    "data": [
        {
            "extra": {},
            "id": "1NXHDFgpO1ZE3ditiEm0wcXumWM",
            "idAlias": "majutembak-16NMJV-XS8W96",
            "amount": "25000.00",
            "status": "success",
            "settlementStatus": null,
            "tokenType": null,
            "userTokenType": null,
            "customerReference": null,
            "customerReferenceName": null,
            "referenceNumber": "000709",
            "referenceNumberName": "invoice_num",
            "cardApprovalCode": "873812",
            "cardNetwork": "visa",
            "cardIssuer": null,
            "cardAcquirer": null,
            "cardPanMasked": null,
            "toCardType": null,
            "aliasThumbnail": null,
            "aliasThumbnailGray": null,
            "locationLong": "107.64704000",
            "locationLat": "-6.94828500",
            "voidReason": null,
            "agentId": 3,
            "terminalId": null,
            "acquirerId": 5,
            "createdAt": "2019-07-04T06:06:46.000Z",
            "updatedAt": "2019-07-04T06:06:46.000Z",
            "transactionExtraKvs": [],
            "acquirer": {
                "id": 5,
                "name": "Kartu Debit Maju Tembak",
                "description": null,
                "minimumAmount": "25000.00",
                "maximumAmount": null,
                "gateway": false,
                "hidden": false,
                "merchantId": 1,
                "acquirerConfigId": 10,
                "acquirerTypeId": 5,
                "acquirerType": {
                    "id": 5,
                    "class": "emvDebit",
                    "name": "Kartu Debit",
                    "description": null,
                    "thumbnail": "card.png",
                    "thumbnailGray": "card-gray.png",
                    "chartColor": "#4A90D9"
                },
                "acquirerConfig": {
                    "id": 10,
                    "name": "Fairpay Default Configuration",
                    "description": null,
                    "handler": "fairpay",
                    "sandbox": true,
                    "merchantId": null
                }
            }
        },
        {
            "extra": {},
            "id": "1NXHA7QulbVb53zcmkjO7SEFuN8",
            "idAlias": "majutembak-16NMJN-PAKN5J",
            "amount": "25000.00",
            "status": "failed",
            "settlementStatus": null,
            "tokenType": "tokenQrCodeUrlImage",
            "userTokenType": "",
            "customerReference": null,
            "customerReferenceName": null,
            "referenceNumber": "0cfc6234-895d-479b-bdc8-f2794ce5a661",
            "referenceNumberName": "transaction_id",
            "cardApprovalCode": null,
            "cardNetwork": null,
            "cardIssuer": null,
            "cardAcquirer": null,
            "cardPanMasked": null,
            "toCardType": null,
            "aliasThumbnail": null,
            "aliasThumbnailGray": null,
            "locationLong": "107.64628667",
            "locationLat": "-6.94834500",
            "voidReason": null,
            "agentId": 3,
            "terminalId": null,
            "acquirerId": 2,
            "createdAt": "2019-07-04T06:06:15.000Z",
            "updatedAt": "2019-07-04T06:09:15.000Z",
            "transactionExtraKvs": [],
            "acquirer": {
                "id": 2,
                "name": "Gopay Maju Tembak",
                "description": null,
                "minimumAmount": "1.00",
                "maximumAmount": null,
                "gateway": false,
                "hidden": false,
                "merchantId": 1,
                "acquirerConfigId": 2,
                "acquirerTypeId": 2,
                "acquirerType": {
                    "id": 2,
                    "class": "gopay",
                    "name": "GO-PAY",
                    "description": null,
                    "thumbnail": "gopay.png",
                    "thumbnailGray": "gopay-gray.png",
                    "chartColor": "#5DA4DA"
                },
                "acquirerConfig": {
                    "id": 2,
                    "name": "Midtrans GOPAY Default Sandbox configuration",
                    "description": null,
                    "handler": "midtrans",
                    "sandbox": true,
                    "merchantId": null
                }
            }
        },
        {
            "extra": {},
            "id": "1NXAADnrCmYwZiPZqMcICvDSWL7",
            "idAlias": "majutembak-16NKQP-GBMHGQ",
            "amount": "25000.00",
            "status": "failed",
            "settlementStatus": null,
            "tokenType": "tokenQrCodeContent",
            "userTokenType": "",
            "customerReference": null,
            "customerReferenceName": null,
            "referenceNumber": null,
            "referenceNumberName": null,
            "cardApprovalCode": null,
            "cardNetwork": null,
            "cardIssuer": null,
            "cardAcquirer": null,
            "cardPanMasked": null,
            "toCardType": null,
            "aliasThumbnail": null,
            "aliasThumbnailGray": null,
            "locationLong": "107.64960500",
            "locationLat": "-6.95158100",
            "voidReason": null,
            "agentId": 3,
            "terminalId": null,
            "acquirerId": 1,
            "createdAt": "2019-07-04T05:08:42.000Z",
            "updatedAt": "2019-07-04T06:17:11.000Z",
            "transactionExtraKvs": [],
            "acquirer": {
                "id": 1,
                "name": "LinkAja Maju Tembak",
                "description": null,
                "minimumAmount": "100.00",
                "maximumAmount": null,
                "gateway": false,
                "hidden": false,
                "merchantId": 1,
                "acquirerConfigId": 1,
                "acquirerTypeId": 1,
                "acquirerType": {
                    "id": 1,
                    "class": "linkaja",
                    "name": "LinkAja",
                    "description": null,
                    "thumbnail": "linkaja.png",
                    "thumbnailGray": "linkaja-gray.png",
                    "chartColor": "#EE1B1F"
                },
                "acquirerConfig": {
                    "id": 1,
                    "name": "Tcash/LinkAja Default configuration",
                    "description": null,
                    "handler": "tcash",
                    "sandbox": true,
                    "merchantId": null
                }
            }
        },
        {
            "extra": {},
            "id": "1NXA8d3H5feZ2xKzRUiWTIcbljs",
            "idAlias": "majutembak-16NKQK-AYZFGC",
            "amount": "25000.00",
            "status": "failed",
            "settlementStatus": null,
            "tokenType": "tokenQrCodeContent",
            "userTokenType": "",
            "customerReference": null,
            "customerReferenceName": null,
            "referenceNumber": null,
            "referenceNumberName": null,
            "cardApprovalCode": null,
            "cardNetwork": null,
            "cardIssuer": null,
            "cardAcquirer": null,
            "cardPanMasked": null,
            "toCardType": null,
            "aliasThumbnail": null,
            "aliasThumbnailGray": null,
            "locationLong": "107.64960500",
            "locationLat": "-6.95158100",
            "voidReason": null,
            "agentId": 3,
            "terminalId": null,
            "acquirerId": 1,
            "createdAt": "2019-07-04T05:08:29.000Z",
            "updatedAt": "2019-07-04T06:17:11.000Z",
            "transactionExtraKvs": [],
            "acquirer": {
                "id": 1,
                "name": "LinkAja Maju Tembak",
                "description": null,
                "minimumAmount": "100.00",
                "maximumAmount": null,
                "gateway": false,
                "hidden": false,
                "merchantId": 1,
                "acquirerConfigId": 1,
                "acquirerTypeId": 1,
                "acquirerType": {
                    "id": 1,
                    "class": "linkaja",
                    "name": "LinkAja",
                    "description": null,
                    "thumbnail": "linkaja.png",
                    "thumbnailGray": "linkaja-gray.png",
                    "chartColor": "#EE1B1F"
                },
                "acquirerConfig": {
                    "id": 1,
                    "name": "Tcash/LinkAja Default configuration",
                    "description": null,
                    "handler": "tcash",
                    "sandbox": true,
                    "merchantId": null
                }
            }
        },
        {
            "extra": {},
            "id": "1NXA7xTz2N1NMuzOO0On4hQzjjg",
            "idAlias": "majutembak-16NKQJ-094SWC",
            "amount": "25000.00",
            "status": "failed",
            "settlementStatus": null,
            "tokenType": "tokenQrCodeContent",
            "userTokenType": "",
            "customerReference": null,
            "customerReferenceName": null,
            "referenceNumber": null,
            "referenceNumberName": null,
            "cardApprovalCode": null,
            "cardNetwork": null,
            "cardIssuer": null,
            "cardAcquirer": null,
            "cardPanMasked": null,
            "toCardType": null,
            "aliasThumbnail": null,
            "aliasThumbnailGray": null,
            "locationLong": "107.64960500",
            "locationLat": "-6.95158100",
            "voidReason": null,
            "agentId": 3,
            "terminalId": null,
            "acquirerId": 1,
            "createdAt": "2019-07-04T05:08:24.000Z",
            "updatedAt": "2019-07-04T06:17:11.000Z",
            "transactionExtraKvs": [],
            "acquirer": {
                "id": 1,
                "name": "LinkAja Maju Tembak",
                "description": null,
                "minimumAmount": "100.00",
                "maximumAmount": null,
                "gateway": false,
                "hidden": false,
                "merchantId": 1,
                "acquirerConfigId": 1,
                "acquirerTypeId": 1,
                "acquirerType": {
                    "id": 1,
                    "class": "linkaja",
                    "name": "LinkAja",
                    "description": null,
                    "thumbnail": "linkaja.png",
                    "thumbnailGray": "linkaja-gray.png",
                    "chartColor": "#EE1B1F"
                },
                "acquirerConfig": {
                    "id": 1,
                    "name": "Tcash/LinkAja Default configuration",
                    "description": null,
                    "handler": "tcash",
                    "sandbox": true,
                    "merchantId": null
                }
            }
        },
        {
            "extra": {},
            "id": "1NX9xVvrJ7QKWgmMvqmNdwp2s0X",
            "idAlias": "majutembak-16NKPX-7CNRMZ",
            "amount": "25000.00",
            "status": "failed",
            "settlementStatus": null,
            "tokenType": "tokenQrCodeContent",
            "userTokenType": "",
            "customerReference": null,
            "customerReferenceName": null,
            "referenceNumber": null,
            "referenceNumberName": null,
            "cardApprovalCode": null,
            "cardNetwork": null,
            "cardIssuer": null,
            "cardAcquirer": null,
            "cardPanMasked": null,
            "toCardType": null,
            "aliasThumbnail": null,
            "aliasThumbnailGray": null,
            "locationLong": "107.64960500",
            "locationLat": "-6.95158100",
            "voidReason": null,
            "agentId": 3,
            "terminalId": null,
            "acquirerId": 1,
            "createdAt": "2019-07-04T05:07:00.000Z",
            "updatedAt": "2019-07-04T06:17:11.000Z",
            "transactionExtraKvs": [],
            "acquirer": {
                "id": 1,
                "name": "LinkAja Maju Tembak",
                "description": null,
                "minimumAmount": "100.00",
                "maximumAmount": null,
                "gateway": false,
                "hidden": false,
                "merchantId": 1,
                "acquirerConfigId": 1,
                "acquirerTypeId": 1,
                "acquirerType": {
                    "id": 1,
                    "class": "linkaja",
                    "name": "LinkAja",
                    "description": null,
                    "thumbnail": "linkaja.png",
                    "thumbnailGray": "linkaja-gray.png",
                    "chartColor": "#EE1B1F"
                },
                "acquirerConfig": {
                    "id": 1,
                    "name": "Tcash/LinkAja Default configuration",
                    "description": null,
                    "handler": "tcash",
                    "sandbox": true,
                    "merchantId": null
                }
            }
        }
    ]
}
""".trimIndent()
internal val getTransactionsUnauthenticatedDummyRaw = """
    {
    "version": "mika-v3-development andra-dev5-c55347a-89 2019-07-09T04:01:42.000Z",
    "status": "auth-401",
    "message": "Not authenticated",
    "isError": true
}
""".trimIndent()
