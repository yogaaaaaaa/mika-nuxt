package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class CheckResponse(
    @SerializedName("data")
    var data: Check,
    @SerializedName("isError")
    var isError: Boolean,
    @SerializedName("message")
    var message: String,
    @SerializedName("status")
    var status: String,
    @SerializedName("version")
    var version: String
)