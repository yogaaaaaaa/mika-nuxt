package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class TransactionResponse(
    @SerializedName("version")
    internal val version: String,
    @SerializedName("status")
    val status: String,
    @SerializedName("message")
    val message: String,
    @SerializedName("isError")
    val isError: Boolean,
    @SerializedName("data")
    val data: ArrayList<Transaction>
)