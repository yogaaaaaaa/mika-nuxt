package id.mikaapp.domain.entities

data class BrokerDetailEntity(
    var broadcastTopic: String? = null,
    var brokerUrl: String? = null,
    var cleanSession: Boolean? = false,
    var clientId: String? = null,
    var clientTopic: String? = null,
    var password: String? = null,
    var serverTopic: String? = null,
    var user: String? = null
)