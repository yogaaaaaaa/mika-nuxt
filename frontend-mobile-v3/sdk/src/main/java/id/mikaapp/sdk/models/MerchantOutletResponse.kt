package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class MerchantOutletResponse(
    @SerializedName("data")
    val data: ArrayList<MerchantOutlet>,
    @SerializedName("isError")
    val isError: Boolean,
    @SerializedName("message")
    val message: String,
    @SerializedName("status")
    val status: String,
    @SerializedName("version")
    val version: String
)