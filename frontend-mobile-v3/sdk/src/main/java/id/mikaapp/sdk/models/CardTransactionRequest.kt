package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class CardTransactionRequest(
    @SerializedName("acquirerId")
    val acquirerId: String,
    @SerializedName("amount")
    val amount: Int,
    @SerializedName("flags")
    val flags: List<Any>,
    @SerializedName("locationLat")
    val locationLat: String,
    @SerializedName("locationLong")
    val locationLong: String,
    @SerializedName("userToken")
    val userToken: UserToken
)