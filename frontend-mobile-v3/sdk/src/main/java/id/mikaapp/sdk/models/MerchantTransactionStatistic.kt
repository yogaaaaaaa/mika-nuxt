package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName
import java.math.BigDecimal

data class MerchantTransactionStatistic(
    @SerializedName("acquirer")
    val acquirer: AcquirerStatData,
    @SerializedName("acquirerId")
    val acquirerId: String,
    @SerializedName("totalAmount")
    val amount: BigDecimal,
    @SerializedName("totalNettAmount")
    val nettAmount: Double,
    @SerializedName("transactionCount")
    val transactionCount: Int
)