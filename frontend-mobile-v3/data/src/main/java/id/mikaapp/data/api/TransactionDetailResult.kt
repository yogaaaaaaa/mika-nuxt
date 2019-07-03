package id.mikaapp.data.api

import com.google.gson.annotations.SerializedName
import id.mikaapp.data.entities.TransactionDetailData

class TransactionDetailResult {
    @SerializedName("data")
    lateinit var data: TransactionDetailData
//    @SerializedName("isError")
//    var isError: Boolean,
//    @SerializedName("message")
//    var message: String,
//    @SerializedName("status")
//    var status: String
}