package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.TransactionDetail

interface TransactionDetailCallback : HttpRequestCallback {

    fun onSuccess(response: TransactionDetail)
    fun onFailure(errorResponse: BasicResponse)
}