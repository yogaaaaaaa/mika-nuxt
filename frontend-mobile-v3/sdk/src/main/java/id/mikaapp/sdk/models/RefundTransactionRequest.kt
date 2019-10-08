package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class RefundTransactionRequest (
    @SerializedName("amount")
    val amount: String?,
    @SerializedName("reason")
    val reason: String?
)