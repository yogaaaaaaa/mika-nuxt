package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CardTransaction

interface CardTransactionCallback : HttpRequestCallback {

    fun onSuccess(response: CardTransaction)
    fun onFailure(errorResponse: BasicResponse)
}