package id.mikaapp.mika.entities

import com.google.gson.annotations.SerializedName

data class TransactionMqttMessage(
    @SerializedName("data")
    val data: Data,
    @SerializedName("eventType")
    val eventType: String,
    @SerializedName("version")
    val version: String
)