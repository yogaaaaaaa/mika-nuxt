package id.mikaapp.mika.entities

import com.google.gson.annotations.SerializedName

data class Data(
    @SerializedName("transaction")
    val transaction: Transaction,
    @SerializedName("transactionId")
    val transactionId: String
)