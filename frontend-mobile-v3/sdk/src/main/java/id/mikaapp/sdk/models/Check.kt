package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class Check(
    @SerializedName("agentId")
    var agentId: Int,
    @SerializedName("iat")
    var iat: Int,
    @SerializedName("terminalId")
    var terminalId: Any,
    @SerializedName("userId")
    var userId: Int,
    @SerializedName("userType")
    var userType: String,
    @SerializedName("username")
    var username: String
)