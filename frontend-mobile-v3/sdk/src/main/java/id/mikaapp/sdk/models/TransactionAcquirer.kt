package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class TransactionAcquirer(
    @SerializedName("acquirerConfigId")
    val acquirerConfigId: String,
    @SerializedName("acquirerType")
    val acquirerType: AcquirerType,
    @SerializedName("acquirerTypeId")
    val acquirerTypeId: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("gateway")
    val gateway: Boolean,
    @SerializedName("hidden")
    val hidden: Boolean,
    @SerializedName("id")
    val id: String,
    @SerializedName("maximumAmount")
    val maximumAmount: Any,
    @SerializedName("merchantId")
    val merchantId: String,
    @SerializedName("minimumAmount")
    val minimumAmount: Int,
    @SerializedName("name")
    val name: String
)