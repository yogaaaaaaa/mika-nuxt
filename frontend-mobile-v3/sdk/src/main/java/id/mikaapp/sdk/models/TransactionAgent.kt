package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class TransactionAgent(
    @SerializedName("description")
    val description: Any,
    @SerializedName("generalLocationLat")
    val generalLocationLat: Any,
    @SerializedName("generalLocationLong")
    val generalLocationLong: Any,
    @SerializedName("generalLocationRadiusMeter")
    val generalLocationRadiusMeter: Any,
    @SerializedName("id")
    val id: String,
    @SerializedName("merchantId")
    val merchantId: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("outletId")
    val outletId: String,
    @SerializedName("userId")
    val userId: String
)