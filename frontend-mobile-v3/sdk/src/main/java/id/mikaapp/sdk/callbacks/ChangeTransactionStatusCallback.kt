package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse

interface ChangeTransactionStatusCallback: HttpRequestCallback {
    fun onSuccess(response: BasicResponse)
    fun onFailure(response: BasicResponse)
}
