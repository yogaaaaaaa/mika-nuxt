package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class Transaction(
    @SerializedName("extra")
    val extra: Any,
    @SerializedName("id")
    val id: String,
    @SerializedName("idAlias")
    val idAlias: String,
    @SerializedName("amount")
    val amount: Int,
    @SerializedName("status")
    /**
     * Indicate status of transaction, two state define :
     * inquiry means transaction is already created and pending for payment,
     * success means transaction is finished,
     * failed means transaction is failed in processing or timed out
     */
    val status: String,
    @SerializedName("settlementStatus")
    val settlementStatus: String,
    @SerializedName("tokenType")
    /**
     * Describe type of token, because payment gateway have different kind of token to represent payment identifier,
     * like number or QR Code.
     * Two tokenType is defined for now, qrCodeContent means that token attributes value need to be converted into
     * QR Code, qrCodeUrlImage means that token attributes value is a URL of already generated QR Code image.
     */
    val tokenType: String,
    @SerializedName("userTokenType")
    val userTokenType: String,
    @SerializedName("customerReference")
    val customerReference: Any,
    @SerializedName("customerReferenceName")
    val customerReferenceName: Any,
    @SerializedName("referenceNumber")
    /**
     * Reference Id to payment gateway. Dependent to payment gateway used
     */
    val referenceNumber: Any,
    @SerializedName("referenceNumberName")
    val referenceNumberName: Any,
    @SerializedName("cardApprovalCode")
    val cardApprovalCode: Any,
    @SerializedName("cardNetwork")
    val cardNetwork: Any,
    @SerializedName("cardIssuer")
    val cardIssuer: Any,
    @SerializedName("cardAcquirer")
    val cardAcquirer: Any,
    @SerializedName("cardPanMasked")
    val cardPanMasked: Any,
    @SerializedName("cardType")
    val cardType: Any,
    @SerializedName("aliasThumbnail")
    val aliasThumbnail: Any,
    @SerializedName("aliasThumbnailGray")
    val aliasThumbnailGray: Any,
    @SerializedName("locationLong")
    val locationLong: String,
    @SerializedName("locationLat")
    val locationLat: String,
    @SerializedName("voidReason")
    val voidReason: Any,
    @SerializedName("agentId")
    val agentId: String,
    @SerializedName("acquirerId")
    val acquirerId: String,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("acquirer")
    val acquirer: Acquirer
)