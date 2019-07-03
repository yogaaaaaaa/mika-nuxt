package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class BasicResponse(
    @SerializedName("isError")
    var isError: Boolean,
    @SerializedName("message")
    var message: String,
    @SerializedName("status")
    /**
     * Status code
     */
    var status: String,
    @SerializedName("version")
    var version: String? = ""
)