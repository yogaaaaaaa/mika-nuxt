package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantTransaction

interface MerchantTransactionCallback : HttpRequestCallback {

    fun onSuccess(response: ArrayList<MerchantTransaction>)
    fun onFailure(errorResponse: BasicResponse)
}