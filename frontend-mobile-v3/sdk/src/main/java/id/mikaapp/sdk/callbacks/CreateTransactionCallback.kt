package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.TokenTransaction

interface CreateTransactionCallback : HttpRequestCallback {

    fun onSuccess(response: TokenTransaction)
    fun onFailure(errorResponse: BasicResponse)
}