package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class BrokerDetail(
        @SerializedName("broadcastTopic")
    var broadcastTopic: String,
        @SerializedName("brokerUrl")
    var brokerUrl: String,
        @SerializedName("brokerUrlAlt")
        var brokerUrlAlt: String?,
        @SerializedName("cleanSession")
    var cleanSession: Boolean,
        @SerializedName("clientId")
    var clientId: String,
        @SerializedName("clientTopic")
    var clientTopic: String,
        @SerializedName("password")
    var password: String,
        @SerializedName("serverTopic")
    var serverTopic: String,
        @SerializedName("user")
    var user: String
)