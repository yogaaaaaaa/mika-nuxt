package id.mikaapp.mika.entities

import com.google.gson.annotations.SerializedName

data class Transaction(
    @SerializedName("agentId")
    val agentId: Int,
    @SerializedName("aliasThumbnail")
    val aliasThumbnail: Any,
    @SerializedName("aliasThumbnailGray")
    val aliasThumbnailGray: Any,
    @SerializedName("amount")
    val amount: Int,
    @SerializedName("cardAcquirer")
    val cardAcquirer: Any,
    @SerializedName("cardApprovalCode")
    val cardApprovalCode: Any,
    @SerializedName("cardIssuer")
    val cardIssuer: Any,
    @SerializedName("cardNetwork")
    val cardNetwork: Any,
    @SerializedName("cardPanMasked")
    val cardPan: Any,
    @SerializedName("cardType")
    val cardType: Any,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("customerReference")
    val customerReference: Any,
    @SerializedName("customerReferenceName")
    val customerReferenceName: Any,
    @SerializedName("deletedAt")
    val deletedAt: Any,
    @SerializedName("extra")
    val extra: Any,
    @SerializedName("id")
    val id: String,
    @SerializedName("idAlias")
    val idAlias: String,
    @SerializedName("ipAddress")
    val ipAddress: String,
    @SerializedName("locationLat")
    val locationLat: String,
    @SerializedName("locationLong")
    val locationLong: String,
    @SerializedName("acquirerId")
    val paymentProviderId: Int,
    @SerializedName("referenceNumber")
    val referenceNumber: Any,
    @SerializedName("referenceNumberName")
    val referenceNumberName: Any,
    @SerializedName("terminalId")
    val terminalId: Any,
    @SerializedName("token")
    val token: String,
    @SerializedName("tokenType")
    val tokenType: String,
    @SerializedName("settlementStatus")
    val settlementStatus: String,
    @SerializedName("status")
    val status: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("userToken")
    val userToken: Any,
    @SerializedName("userTokenType")
    val userTokenType: Any,
    @SerializedName("voidReason")
    val voidReason: Any
)