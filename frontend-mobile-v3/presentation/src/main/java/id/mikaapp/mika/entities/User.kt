package id.mikaapp.mika.entities

data class User(
    var agentId: Int?,
    var authExpirySecond: Int,
    var brokerDetail: BrokerDetail? = null,
    var sessionToken: String?,
    var terminalId: Int?,
    var userId: Int?,
    var userType: String?,
    var username: String?
)