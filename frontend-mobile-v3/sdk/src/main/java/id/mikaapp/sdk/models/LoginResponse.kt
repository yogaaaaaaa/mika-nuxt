package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class LoginResponse(
    @SerializedName("version")
    internal val version: String,
    @SerializedName("status")
    var status: String,
    @SerializedName("message")
    var message: String,
    @SerializedName("isError")
    var isError: Boolean,
    @SerializedName("data")
    var data: User
)