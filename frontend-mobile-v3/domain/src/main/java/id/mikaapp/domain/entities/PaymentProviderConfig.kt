package id.mikaapp.domain.entities

/**
 * Created by grahamdesmon on 08/04/19.
 */

data class PaymentProviderConfig(
    var description: Any? = null,
    var handler: String? = null,
    var id: Int? = null,
    var merchantId: Any? = null,
    var name: String? = null,
    var sandboxConfig: Boolean? = null
)