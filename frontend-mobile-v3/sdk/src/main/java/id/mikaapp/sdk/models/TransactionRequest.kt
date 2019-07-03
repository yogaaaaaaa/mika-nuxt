package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class TransactionRequest(
    @SerializedName("amount")
    var amount: Int,
    @SerializedName("locationLat")
    var locationLat: String,
    @SerializedName("locationLong")
    var locationLong: String,
    @SerializedName("acquirerId")
    var acquirerId: String
)