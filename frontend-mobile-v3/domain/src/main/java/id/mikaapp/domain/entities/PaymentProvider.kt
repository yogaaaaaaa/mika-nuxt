package id.mikaapp.domain.entities

/**
 * Created by grahamdesmon on 08/04/19.
 */

data class PaymentProvider(
    var description: Any,
    var gateway: Boolean,
    var hidden: Boolean,
    var id: Int,
    var maximumAmount: Any,
    var merchantId: Any,
    var minimumAmount: Int,
    var name: String,
    var paymentProviderConfig: PaymentProviderConfig,
    var paymentProviderConfigId: Int,
    var paymentProviderType: PaymentProviderType,
    var paymentProviderTypeId: Int
)