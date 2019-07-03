package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class AcquirerStatData(
    @SerializedName("acquirerType")
    val acquirerType: AcquirerType,
    @SerializedName("acquirerTypeId")
    val acquirerTypeId: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("id")
    val id: String,
    @SerializedName("merchantId")
    val merchantId: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("shareMerchant")
    val shareMerchant: Double
)