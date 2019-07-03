package id.mikaapp.data.mappers

import id.mikaapp.data.entities.PaymentProviderData
import id.mikaapp.domain.common.Mapper
import id.mikaapp.domain.entities.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Created by grahamdesmon on 08/04/19.
 */

@Singleton
class PaymentProviderDataEntityMapper @Inject constructor() : Mapper<PaymentProviderData, PaymentProviderEntity>() {

    override fun mapFrom(from: PaymentProviderData): PaymentProviderEntity {
        val paymentProviderEntity = PaymentProviderEntity(
            description = from.description,
            gateway = from.gateway,
            hidden = from.hidden,
            id = from.id,
            maximumAmount = from.maximumAmount,
            merchantId = from.merchantId,
            minimumAmount = from.minimumAmount,
            name = from.name,
            paymentProviderConfigId = from.paymentProviderConfigId,
            paymentProviderTypeId = from.paymentProviderTypeId
        )
        val hander = Handler()
        hander.name = from.handler.name
        hander.classes = from.handler.classes

        val handlerProperties = Properties()
        handlerProperties.flows = from.handler.properties.flows
        handlerProperties.tokenTypes = from.handler.properties.tokenTypes
        handlerProperties.userTokenTypes = from.handler.properties.userTokenTypes
        hander.properties = handlerProperties

        val paymentProviderConfig = PaymentProviderConfig()
        paymentProviderConfig.description = from.paymentProviderConfig.description
        paymentProviderConfig.handler = from.paymentProviderConfig.handler
        paymentProviderConfig.id = from.paymentProviderConfig.id
        paymentProviderConfig.merchantId = from.paymentProviderConfig.merchantId
        paymentProviderConfig.name = from.paymentProviderConfig.name
        paymentProviderConfig.sandboxConfig = from.paymentProviderConfig.sandboxConfig

        val paymentProviderType = PaymentProviderType()
        paymentProviderType.chartColor = from.paymentProviderType.chartColor
        paymentProviderType.classX = from.paymentProviderType.classX
        paymentProviderType.description = from.paymentProviderType.description
        paymentProviderType.id = from.paymentProviderType.id
        paymentProviderType.thumbnail = from.paymentProviderType.thumbnail
        paymentProviderType.thumbnailGray = from.paymentProviderType.thumbnailGray

        paymentProviderEntity.paymentProviderConfig = paymentProviderConfig
        paymentProviderEntity.paymentProviderType = paymentProviderType
        paymentProviderEntity.handler = hander

        return paymentProviderEntity
    }

}