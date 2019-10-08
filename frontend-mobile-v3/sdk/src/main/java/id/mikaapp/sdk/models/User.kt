package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("sessionToken")
    internal var sessionToken: String,
    @SerializedName("authExpirySecond")
    var authExpirySecond: Int,
    @SerializedName("publicDetails")
    internal val publicDetails: PublicDetails,
    @SerializedName("userId")
    internal var userId: String? = null,
    @SerializedName("username")
    var username: String? = null,
    @SerializedName("userType")
    var userType: String? = null,
    @SerializedName("agentId")
    internal var agentId: String? = null,
    @SerializedName("outletId")
    internal var outletId: String? = null,
    @SerializedName("merchantId")
    internal var merchantId: String? = null,
    @SerializedName("brokerDetail")
    internal var brokerDetailData: BrokerDetail
) {
    data class PublicDetails(
        @SerializedName("thumbnailsBaseUrl")
        val thumbnailBaseURL: String
    )
}