package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.Transaction

interface TransactionCallback : HttpRequestCallback {

    fun onSuccess(response: ArrayList<Transaction>)
    fun onFailure(errorResponse: BasicResponse)
}