package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class MerchantStaffResponse(
    @SerializedName("data")
    val data: MerchantStaff,
    @SerializedName("isError")
    val isError: Boolean,
    @SerializedName("message")
    val message: String,
    @SerializedName("status")
    val status: String,
    @SerializedName("version")
    val version: String
)