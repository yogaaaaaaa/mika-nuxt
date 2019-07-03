package id.mikaapp.domain.entities

data class UserEntity(

    var agentId: Int?,
    var authExpirySecond: Int,
    var brokerDetail: BrokerDetailEntity? = null,
    var sessionToken: String?,
    var terminalId: Int?,
    var userId: Int?,
    var userType: String?,
    var username: String?
)