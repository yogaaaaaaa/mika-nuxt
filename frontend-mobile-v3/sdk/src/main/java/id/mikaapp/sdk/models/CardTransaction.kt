package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class CardTransaction(
    @SerializedName("acquirerId")
    val acquirerId: String,
    @SerializedName("agentId")
    val agentId: String,
    @SerializedName("amount")
    val amount: Int,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("transactionId")
    val transactionId: String,
    @SerializedName("transactionStatus")
    val transactionStatus: String
)