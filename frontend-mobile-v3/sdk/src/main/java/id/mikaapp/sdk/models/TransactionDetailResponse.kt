package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

class TransactionDetailResponse(
    @SerializedName("data")
    var data: TransactionDetail,
    @SerializedName("isError")
    var isError: Boolean,
    @SerializedName("message")
    var message: String,
    @SerializedName("status")
    var status: String
)