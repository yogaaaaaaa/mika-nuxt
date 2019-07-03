package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class BrokerDetailData(
    @SerializedName("broadcastTopic")
    var broadcastTopic: String? = null,
    @SerializedName("brokerUrl")
    var brokerUrl: String? = null,
    @SerializedName("cleanSession")
    var cleanSession: Boolean? = false,
    @SerializedName("clientId")
    var clientId: String? = null,
    @SerializedName("clientTopic")
    var clientTopic: String? = null,
    @SerializedName("password")
    var password: String? = null,
    @SerializedName("serverTopic")
    var serverTopic: String? = null,
    @SerializedName("user")
    var user: String? = null
)