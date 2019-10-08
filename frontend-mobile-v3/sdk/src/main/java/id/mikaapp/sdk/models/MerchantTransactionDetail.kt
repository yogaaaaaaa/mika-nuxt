package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName
import java.math.BigDecimal

data class MerchantTransactionDetail(
    @SerializedName("acquirer")
    val acquirer: Acquirer,
    @SerializedName("acquirerId")
    val acquirerId: String,
    @SerializedName("agent")
    val agent: TransactionAgent,
    @SerializedName("agentId")
    val agentId: String,
    @SerializedName("aliasThumbnail")
    val aliasThumbnail: Any,
    @SerializedName("aliasThumbnailGray")
    val aliasThumbnailGray: Any,
    @SerializedName("amount")
    val amount: BigDecimal,
    @SerializedName("cardAcquirer")
    val cardAcquirer: Any,
    @SerializedName("cardApprovalCode")
    val cardApprovalCode: String,
    @SerializedName("cardIssuer")
    val cardIssuer: Any,
    @SerializedName("cardNetwork")
    val cardNetwork: Any,
    @SerializedName("cardPanMasked")
    val cardPanMasked: String,
    @SerializedName("toCardType")
    val cardType: Any,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("customerReference")
    val customerReference: Any,
    @SerializedName("customerReferenceName")
    val customerReferenceName: Any,
    @SerializedName("extra")
    val extra: Extra,
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
    @SerializedName("referenceNumber")
    val referenceNumber: String,
    @SerializedName("referenceNumberName")
    val referenceNumberName: Any,
    @SerializedName("settlementStatus")
    val settlementStatus: String,
    @SerializedName("status")
    val status: String,
    @SerializedName("terminalId")
    val terminalId: Any,
    @SerializedName("token")
    val token: String,
    @SerializedName("tokenType")
    val tokenType: String,
    @SerializedName("transactionExtraKvs")
    val transactionExtraKvs: List<Any>,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("userToken")
    val userToken: Any,
    @SerializedName("userTokenType")
    val userTokenType: Any,
    @SerializedName("voidReason")
    val voidReason: Any,
    @SerializedName("transactionRefunds")
    val transactionRefunds: List<Transaction.TransactionRefund>
) {
    data class TransactionRefund(
        @SerializedName("id")
        val id: String,
        @SerializedName("amount")
        val amount: BigDecimal,
        @SerializedName("reason")
        val reason: String?,
        @SerializedName("reference")
        val reference: String,
        @SerializedName("referenceName")
        val referenceName: String,
        @SerializedName("createdAt")
        val createdAt: String,
        @SerializedName("updatedAt")
        val updatedAt: String
    )
}