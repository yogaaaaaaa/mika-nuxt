package id.mikaapp.data.mappers

import id.mikaapp.data.entities.BrokerDetailData
import id.mikaapp.data.entities.UserData
import id.mikaapp.domain.common.Mapper
import id.mikaapp.domain.entities.BrokerDetailEntity
import id.mikaapp.domain.entities.UserEntity
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Created by grahamdesmon on 04/04/19.
 */

@Singleton
class UserEntityDataMapper @Inject constructor() : Mapper<UserEntity, UserData>() {

    override fun mapFrom(from: UserEntity): UserData {
        val userData = UserData(
            agentId = from.agentId,
            authExpirySecond = from.authExpirySecond,
            sessionToken = from.sessionToken,
            terminalId = from.terminalId,
            userId = from.userId,
            userType = from.userType,
            username = from.username
        )
        val brokerDetail = BrokerDetailData()
        brokerDetail.broadcastTopic = from.brokerDetail?.broadcastTopic
        brokerDetail.brokerUrl = from.brokerDetail?.brokerUrl
        brokerDetail.clientTopic = from.brokerDetail?.clientTopic
        brokerDetail.serverTopic = from.brokerDetail?.serverTopic
        brokerDetail.user = from.brokerDetail?.user
        brokerDetail.password = from.brokerDetail?.password
        brokerDetail.cleanSession = from.brokerDetail?.cleanSession
        brokerDetail.clientId = from.brokerDetail?.clientId
        userData.brokerDetailData = brokerDetail

        return userData
    }

}