package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class TransactionDetailData(
    @SerializedName("agentId")
    var agentId: Int,
    @SerializedName("aliasThumbnail")
    var aliasThumbnail: Any,
    @SerializedName("aliasThumbnailGray")
    var aliasThumbnailGray: Any,
    @SerializedName("amount")
    var amount: Int,
    @SerializedName("cardAcquirer")
    var cardAcquirer: Any,
    @SerializedName("cardApprovalCode")
    var cardApprovalCode: Any,
    @SerializedName("cardIssuer")
    var cardIssuer: Any,
    @SerializedName("cardNetwork")
    var cardNetwork: Any,
    @SerializedName("cardPan")
    var cardPan: Any,
    @SerializedName("cardType")
    var cardType: Any,
    @SerializedName("createdAt")
    var createdAt: String,
    @SerializedName("customerReference")
    var customerReference: Any,
    @SerializedName("customerReferenceType")
    var customerReferenceType: Any,
    @SerializedName("extra")
    var extra: Any,
    @SerializedName("id")
    var id: Int,
    @SerializedName("ipAddress")
    var ipAddress: String,
    @SerializedName("locationLat")
    var locationLat: String,
    @SerializedName("locationLong")
    var locationLong: String,
    @SerializedName("partnerId")
    var partnerId: Any,
    @SerializedName("paymentProvider")
    var paymentProvider: PaymentProvider,
    @SerializedName("paymentProviderId")
    var paymentProviderId: Int,
    @SerializedName("referenceNumber")
    var referenceNumber: Any,
    @SerializedName("referenceNumberType")
    var referenceNumberType: Any,
    @SerializedName("terminalId")
    var terminalId: Any,
    @SerializedName("token")
    var token: String,
    @SerializedName("tokenType")
    var tokenType: String,
    @SerializedName("transactionSettlementStatus")
    var transactionSettlementStatus: String,
    @SerializedName("transactionStatus")
    var transactionStatus: String,
    @SerializedName("updatedAt")
    var updatedAt: String,
    @SerializedName("userToken")
    var userToken: Any,
    @SerializedName("userTokenType")
    var userTokenType: Any,
    @SerializedName("voidReason")
    var voidReason: Any
)