package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class AcquirerConfig(
    @SerializedName("description")
    val description: Any,
    @SerializedName("handler")
    val handler: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("merchantId")
    val merchantId: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("sandbox")
    val sandbox: Boolean
)