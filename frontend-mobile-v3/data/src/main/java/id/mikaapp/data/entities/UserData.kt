package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class UserData(
    @SerializedName("agentId")
    var agentId: Int? = null,
    @SerializedName("authExpirySecond")
    var authExpirySecond: Int,
    @SerializedName("brokerDetail")
    var brokerDetailData: BrokerDetailData? = null,
    @SerializedName("sessionToken")
    var sessionToken: String? = null,
    @SerializedName("terminalId")
    var terminalId: Int? = null,
    @SerializedName("userId")
    var userId: Int? = null,
    @SerializedName("userType")
    var userType: String? = null,
    @SerializedName("username")
    var username: String? = null
)