package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class Acquirer(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("minimumAmount")
    /**
     * Minimum amount allowed for this payment gateway
     */
    val minimumAmount: Int,
    @SerializedName("maximumAmount")
    val maximumAmount: Any,
    @SerializedName("gateway")
    internal val gateway: Boolean,
    @SerializedName("hidden")
    internal val hidden: Boolean,
    @SerializedName("merchantId")
    internal val merchantId: String,
    @SerializedName("acquirerConfigId")
    internal val acquirerConfigId: String,
    @SerializedName("acquirerTypeId")
    internal val acquirerTypeId: String,
    @SerializedName("acquirerType")
    val acquirerType: AcquirerType,
    @SerializedName("acquirerConfig")
    val acquirerConfig: AcquirerConfig,
    @SerializedName("_handler")
    internal val handler: Handler? = null
) {

    val canRefund get() : Boolean = handler?.properties?.flows?.contains("flowRefund")?:false
    val canPartialRefund get() : Boolean = handler?.properties?.flows?.contains("flowPartialRefund")?:false

}