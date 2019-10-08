package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class BasicResponse(
    @SerializedName("version")
    internal val version: String,
    @SerializedName("isError")
    val isError: Boolean,
    @SerializedName("message")
    val message: String,
    @SerializedName("status")
    /**
     * Status code
     */
    val status: String
)