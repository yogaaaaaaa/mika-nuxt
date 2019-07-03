package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class MerchantStatisticCount(
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("transactionCount")
    val transactionCount: Int
)