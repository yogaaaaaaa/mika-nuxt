package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class PaymentProviderData(
    @SerializedName("_handler")
    var handler: Handler,
    @SerializedName("description")
    var description: Any,
    @SerializedName("gateway")
    var gateway: Boolean,
    @SerializedName("hidden")
    var hidden: Boolean,
    @SerializedName("id")
    var id: Int,
    @SerializedName("maximumAmount")
    var maximumAmount: Any,
    @SerializedName("merchantId")
    var merchantId: Any,
    @SerializedName("minimumAmount")
    var minimumAmount: Int,
    @SerializedName("name")
    var name: String,
    @SerializedName("paymentProviderConfig")
    var paymentProviderConfig: PaymentProviderConfig,
    @SerializedName("paymentProviderConfigId")
    var paymentProviderConfigId: Int,
    @SerializedName("paymentProviderType")
    var paymentProviderType: PaymentProviderType,
    @SerializedName("paymentProviderTypeId")
    var paymentProviderTypeId: Int
)