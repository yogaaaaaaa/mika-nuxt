package id.mikaapp.mika.mappers

import id.mikaapp.domain.common.Mapper
import id.mikaapp.domain.entities.UserEntity
import id.mikaapp.mika.entities.BrokerDetail
import id.mikaapp.mika.entities.User

/**
 * Created by grahamdesmon on 06/04/19.
 */

class UserEntityUserMapper : Mapper<UserEntity, User>() {

    override fun mapFrom(from: UserEntity): User {
        val user = User(
            agentId = from.agentId,
            authExpirySecond = from.authExpirySecond,
            sessionToken = from.sessionToken,
            terminalId = from.terminalId,
            userId = from.userId,
            userType = from.userType,
            username = from.username
        )
        val brokerDetail = BrokerDetail()
        brokerDetail.broadcastTopic = from.brokerDetail?.broadcastTopic
        brokerDetail.brokerUrl = from.brokerDetail?.brokerUrl
        brokerDetail.clientTopic = from.brokerDetail?.clientTopic
        brokerDetail.serverTopic = from.brokerDetail?.serverTopic
        brokerDetail.user = from.brokerDetail?.user
        brokerDetail.password = from.brokerDetail?.password
        brokerDetail.cleanSession = from.brokerDetail?.cleanSession
        brokerDetail.clientId = from.brokerDetail?.clientId
        user.brokerDetail = brokerDetail

        return user
    }
}