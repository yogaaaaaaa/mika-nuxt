package id.mikaapp.data.mappers

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
class UserDataEntityMapper @Inject constructor() : Mapper<UserData, UserEntity>() {

    override fun mapFrom(from: UserData): UserEntity {
        val userEntity = UserEntity(
            agentId = from.agentId,
            authExpirySecond = from.authExpirySecond,
            sessionToken = from.sessionToken,
            terminalId = from.terminalId,
            userId = from.userId,
            userType = from.userType,
            username = from.username

        )
        val brokerDetail = BrokerDetailEntity()
        brokerDetail.broadcastTopic = from.brokerDetailData?.broadcastTopic
        brokerDetail.brokerUrl = from.brokerDetailData?.brokerUrl
        brokerDetail.clientTopic = from.brokerDetailData?.clientTopic
        brokerDetail.serverTopic = from.brokerDetailData?.serverTopic
        brokerDetail.user = from.brokerDetailData?.user
        brokerDetail.password = from.brokerDetailData?.password
        brokerDetail.cleanSession = from.brokerDetailData?.cleanSession
        brokerDetail.clientId = from.brokerDetailData?.clientId
        userEntity.brokerDetail = brokerDetail

        return userEntity
    }

}