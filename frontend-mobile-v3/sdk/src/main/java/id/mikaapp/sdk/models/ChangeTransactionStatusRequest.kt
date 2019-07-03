package id.mikaapp.sdk.models

data class ChangeTransactionStatusRequest(
    val transactionId: String,
    val status: String
)