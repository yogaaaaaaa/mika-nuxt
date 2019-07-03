package id.mikaapp.data.api

import com.google.gson.annotations.SerializedName
import id.mikaapp.data.entities.Meta
import id.mikaapp.data.entities.TransactionData

/**
 * Created by grahamdesmon on 08/04/19.
 */

class TransactionsResult {

    var page: Int = 0
    @SerializedName("data")
    lateinit var data: List<TransactionData>
//    @SerializedName("isError")
//    var isError: Boolean? = false
//    @SerializedName("message")
//    var message: String
//    @SerializedName("meta")
//    var meta: Meta ?= null
//    @SerializedName("status")
//    var status: String
}