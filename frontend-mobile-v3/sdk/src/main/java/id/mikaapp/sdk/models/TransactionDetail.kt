package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class TransactionDetail(
    @SerializedName("agentId")
    var agentId: String,
    @SerializedName("aliasThumbnail")
    var aliasThumbnail: Any? = "",
    @SerializedName("aliasThumbnailGray")
    var aliasThumbnailGray: Any? = "",
    @SerializedName("amount")
    var amount: Int,
    @SerializedName("cardAcquirer")
    var cardAcquirer: Any? = "",
    @SerializedName("cardApprovalCode")
    var cardApprovalCode: String? = "",
    @SerializedName("cardIssuer")
    var cardIssuer: Any? = "",
    @SerializedName("cardNetwork")
    var cardNetwork: Any? = "",
    @SerializedName("cardPanMasked")
    var cardPan: String? = "",
    @SerializedName("cardType")
    var cardType: Any? = "",
    @SerializedName("createdAt")
    var createdAt: String? = "",
    @SerializedName("customerReference")
    var customerReference: Any? = "",
    @SerializedName("customerReferenceType")
    var customerReferenceType: Any? = "",
    @SerializedName("extra")
    var extra: Any? = "",
    @SerializedName("id")
    var id: String? = "",
    @SerializedName("idAlias")
    var idAlias: String? = "",
    @SerializedName("ipAddress")
    var ipAddress: String? = "",
    @SerializedName("locationLat")
    var locationLat: String? = "",
    @SerializedName("locationLong")
    var locationLong: String? = "",
    @SerializedName("partnerId")
    var partnerId: Any? = "",
    @SerializedName("acquirer")
    var acquirer: Acquirer,
    @SerializedName("acquirerId")
    var acquirerId: String,
    @SerializedName("referenceNumber")
    /**
     * Reference Id to payment gateway. Dependent to payment gateway used
     */
    var referenceNumber: Any? = "",
    @SerializedName("referenceNumberType")
    var referenceNumberType: Any? = "",
    @SerializedName("terminalId")
    var terminalId: Any? = "",
    @SerializedName("token")
    /**
     * Token value, dependent to tokenType attributes
     */
    var token: String? = "",
    @SerializedName("tokenType")
    /**
     * Describe type of token, because payment gateway have different kind of token to represent payment identifier,
     * like number or QR Code.
     * Two tokenType is defined for now, qrCodeContent means that token attributes value need to be converted into
     * QR Code, qrCodeUrlImage means that token attributes value is a URL of already generated QR Code image.
     */
    var tokenType: String? = "",
    @SerializedName("settlementStatus")
    var transactionSettlementStatus: String? = "",
    @SerializedName("status")
    /**
     * Indicate status of transaction, two state define :
     * inquiry means transaction is already created and pending for payment,
     * success means transaction is finished,
     * failed means transaction is failed in processing or timed out
     */
    var status: String? = "",
    @SerializedName("updatedAt")
    var updatedAt: String? = "",
    @SerializedName("userToken")
    var userToken: Any? = "",
    @SerializedName("userTokenType")
    var userTokenType: Any? = "",
    @SerializedName("voidReason")
    var voidReason: Any? = ""
)