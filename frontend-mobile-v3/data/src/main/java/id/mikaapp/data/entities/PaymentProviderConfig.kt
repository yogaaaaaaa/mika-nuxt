package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class PaymentProviderConfig(
    @SerializedName("description")
    var description: Any,
    @SerializedName("handler")
    var handler: String,
    @SerializedName("id")
    var id: Int,
    @SerializedName("merchantId")
    var merchantId: Any,
    @SerializedName("name")
    var name: String,
    @SerializedName("sandboxConfig")
    var sandboxConfig: Boolean
)